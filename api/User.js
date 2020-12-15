import { Router } from 'express'
import {} from '../firebase-admin'
import { groupCol, userCol } from '../web-client/src/firebase-web'
import { pushText, setRichmenuFor } from '../webhook/LINE/functions'

const userAPI = Router()

userAPI.post('/create-auth-token', async (req, res) => {
    const { access_token, user_id, group_id } = req.body
    try {
        if ( typeof access_token === 'undefined') {
            res.status(404).send('AccessToken Not Found')
        }
        const { data: { client_id } } = await axios.get(`https://api.line.me/oauth2/v2.1/verify?access_token=${access_token}`)
        if ( client_id !== LINE_CHANNEL_ID ) {
            res.status(401).send('Unauthorized')
        }
        const firebaseUser = await firebase.auth().getUser(user_id)
        const token = await firebase.auth().createCustomToken(firebaseUser.uid)
        res.status(200).send(token)
    } catch (err) {
        if (err.code === 'auth/user-not-found') {
            const firebaseUser = await firebase.auth().createUser({
                uid: user_id,
                gid: group_id
            })
            const token = await firebase.auth().createCustomToken(firebaseUser.uid)
            res.status(200).send(token)
        }
        console.error(err)
        res.status(500).send('Internal Server Error')
    }
})

userAPI.post('/register', async (req, res) => {
    try {
        const { userId, groupId, localLocation } = req.body;
        const group = await groupCol.doc(groupId).get()
        if (group.exists) {
            const user = await userCol.doc(userId).get()    
            if (!user.exists || !user.data().groupId) {
                if (user.exists) {
                    await userCol.doc(userId).update({ 
                        groupId: groupId,
                        localLocation: localLocation
                    })
                    await setRichmenuFor(userId)
                    await pushText(userId, [
                        'มาเรื่มใช้งานกันเลยนะครับ',
                        'คุณสามารถเข้าไป "เลือกซื้อสินค้า" หรือจะลงขายสินต้าได้ใน "ร้านค้าของฉัน" ในเมนูหลักได้เลยยย'
                    ])
                } else {
                    console.log('API:: user not exists')
                    await userCol.doc(userId).set({ 
                        groupId: groupId,
                        localLocation: localLocation
                    })
                }
                res.status(201).send();
            }
            res.status(200).send();
        }
        res.status(404).send('Not found')
    }
    catch (err) {
        console.log(err)
        res.status(500).send('Internal Server Error');
    }
})

export default userAPI