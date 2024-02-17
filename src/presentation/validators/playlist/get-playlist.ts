import { object, string, type ObjectSchema } from 'yup'
import { type GetPlaylistRequest } from '../../protocols/requests/get-playlist'

export const getPlaylistValidation: ObjectSchema<GetPlaylistRequest> = object({
  params: object({
    service: string().required(),
    playlistId: string().required()
  })
})
