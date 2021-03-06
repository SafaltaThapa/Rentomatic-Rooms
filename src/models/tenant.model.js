import { Schema } from 'mongoose'
import { CommonRoomDetails } from './common.data'

export const TenantSchema = new Schema({
    occupation: {
        type: String,
        enum: ['Student', 'Employeed', 'Retired', 'Other'],
        required: [true, 'Occupation is required'],
    },
    preferredRooms: {
        ...CommonRoomDetails,
        availableWithin: {
            type: Date,
            required: [true, 'Available within is required'],
        },
        roomLocation: {
            type: String,
            enum: [
                'Kathmandu',
                'Bhaktapur',
                'Lalitpur',
                'Patan',
                'Boudha',
                'Baneshwor',
                'Pepsicola',
                'Kirtipur',
            ],
            required: [true, 'Room location is required'],
        },
    },
    profileDescription: {
        bio: {
            type: String,
            required: [true, 'Bio is required'],
        },
        image: {
            type: String,
            required: [true, 'Image is required'],
        },
    },
})
