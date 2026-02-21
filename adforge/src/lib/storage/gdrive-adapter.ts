import { google } from 'googleapis'
import type { StorageAdapter, StorageFile, UploadOptions } from './types'
import { Readable } from 'stream'

/**
 * Google Drive storage adapter
 * Stores files in a shared Google Drive folder
 */
export class GoogleDriveAdapter implements StorageAdapter {
  private drive
  private folderId: string

  constructor() {
    // Initialize Google Drive API client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    })

    this.drive = google.drive({ version: 'v3', auth })
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || ''

    if (!this.folderId) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID is not set')
    }
  }

  /**
   * Get or create a folder in Google Drive
   * Creates nested folder structure (e.g., product-images/user-id/product-id/)
   */
  private async getOrCreateFolder(path: string): Promise<string> {
    const pathParts = path.split('/').filter(Boolean)
    const folders = pathParts.slice(0, -1) // Remove filename

    let currentFolderId = this.folderId

    for (const folderName of folders) {
      // Check if folder exists
      const { data } = await this.drive.files.list({
        q: `name='${folderName}' and '${currentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      })

      if (data.files && data.files.length > 0) {
        currentFolderId = data.files[0].id!
      } else {
        // Create folder
        const { data: folder } = await this.drive.files.create({
          requestBody: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [currentFolderId],
          },
          fields: 'id',
        })
        currentFolderId = folder.id!
      }
    }

    return currentFolderId
  }

  /**
   * Upload a file to Google Drive
   */
  async upload(
    file: Buffer | Blob,
    path: string,
    options?: UploadOptions
  ): Promise<StorageFile> {
    try {
      // Get or create folder structure
      const parentFolderId = await this.getOrCreateFolder(path)
      const fileName = path.split('/').pop()!

      // Convert file to stream
      const buffer = file instanceof Buffer ? file : Buffer.from(await file.arrayBuffer())
      const stream = Readable.from(buffer)

      // Upload file
      const { data } = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: [parentFolderId],
          mimeType: options?.contentType || 'application/octet-stream',
        },
        media: {
          mimeType: options?.contentType || 'application/octet-stream',
          body: stream,
        },
        fields: 'id, name, size, webViewLink, webContentLink',
      })

      // Make file publicly accessible
      await this.drive.permissions.create({
        fileId: data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      })

      // Get direct download link
      const publicUrl = `https://drive.google.com/uc?export=download&id=${data.id}`

      return {
        path,
        publicUrl,
        size: parseInt(data.size || '0'),
        mimeType: options?.contentType || 'application/octet-stream',
      }
    } catch (error) {
      console.error('Google Drive upload error:', error)
      throw new Error(`Failed to upload to Google Drive: ${error}`)
    }
  }

  /**
   * Download a file from Google Drive
   */
  async download(path: string): Promise<Buffer> {
    try {
      // Find file by path
      const fileId = await this.findFileByPath(path)

      if (!fileId) {
        throw new Error(`File not found: ${path}`)
      }

      // Download file
      const { data } = await this.drive.files.get(
        {
          fileId,
          alt: 'media',
        },
        { responseType: 'arraybuffer' }
      )

      return Buffer.from(data as ArrayBuffer)
    } catch (error) {
      console.error('Google Drive download error:', error)
      throw new Error(`Failed to download from Google Drive: ${error}`)
    }
  }

  /**
   * Delete a file from Google Drive
   */
  async delete(path: string): Promise<void> {
    try {
      const fileId = await this.findFileByPath(path)

      if (fileId) {
        await this.drive.files.delete({ fileId })
      }
    } catch (error) {
      console.error('Google Drive delete error:', error)
      throw new Error(`Failed to delete from Google Drive: ${error}`)
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(path: string): string {
    // Note: This returns a placeholder URL
    // The actual URL is generated during upload
    // For real usage, store the fileId in the database
    return `https://drive.google.com/file/d/${path}/view`
  }

  /**
   * Check if a file exists
   */
  async exists(path: string): Promise<boolean> {
    try {
      const fileId = await this.findFileByPath(path)
      return !!fileId
    } catch {
      return false
    }
  }

  /**
   * Find a file by its path (helper method)
   * Traverses the folder structure to find the file
   */
  private async findFileByPath(path: string): Promise<string | null> {
    try {
      const pathParts = path.split('/').filter(Boolean)
      const fileName = pathParts.pop()!
      let currentFolderId = this.folderId

      // Traverse folders
      for (const folderName of pathParts) {
        const { data } = await this.drive.files.list({
          q: `name='${folderName}' and '${currentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          fields: 'files(id)',
        })

        if (!data.files || data.files.length === 0) {
          return null
        }

        currentFolderId = data.files[0].id!
      }

      // Find file
      const { data } = await this.drive.files.list({
        q: `name='${fileName}' and '${currentFolderId}' in parents and trashed=false`,
        fields: 'files(id)',
      })

      return data.files && data.files.length > 0 ? data.files[0].id! : null
    } catch (error) {
      console.error('Error finding file:', error)
      return null
    }
  }
}
