import { type ObjectSchema, object, string } from 'yup'
import { type GetPlaylistRequest } from '../../../protocols/requests/get-playlist'

export const getPlaylistValidation: ObjectSchema<GetPlaylistRequest> = object({
  params: object({
    service: string().required(),
    playlistId: string().required()
  })
})
