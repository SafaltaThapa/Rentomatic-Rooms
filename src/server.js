import mongoose from 'mongoose'
import app from './app'

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    mongoose
        .connect(process.env.MONGO_URI, { dbName: 'airbnb' })
        .then(() => {
            console.log('Connected to MongoDB')
        })
        .catch(error => console.error(error))
    console.log(`Server is running on port ${PORT}`)
})
