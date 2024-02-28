import { type ObjectSchema, object, string } from 'yup'
import { type CreatePlaylistRequest } from '../../protocols/requests/create-playlist'

export const createPlaylistValidation: ObjectSchema<CreatePlaylistRequest> = object({
  body: object({
    from: string().trim().required(),
    to: string().trim().required(),
    playlistId: string().trim().required()
  })
})
