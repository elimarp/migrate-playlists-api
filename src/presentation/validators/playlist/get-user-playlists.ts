import { type ObjectSchema, object, string } from 'yup'
import { type GetUserPlaylistsRequest } from '../../protocols/requests/get-user-playlists'

export const getUserPlaylistsValidation: ObjectSchema<GetUserPlaylistsRequest> = object({
  params: object({
    service: string().required(),
    userId: string().required()
  })
})
