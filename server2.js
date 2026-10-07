const { ILike } = require('typeorm');
const express = require('express');
const AppDataSource = require('./db');

const app = express();
app.use(express.json());
 
AppDataSource.initialize().then(() => {
    console.log('Data Source has been initialized!');
}).catch((err) => {
    console.error('Error during Data Source initialization', err);
});

app.get('/', (req, res) => {
    const userRepository = AppDataSource.getRepository('user');
    userRepository.find().then(users => {
        res.json(users);        
    }).catch(err => {
        console.error('Error fetching users', err);
        res.status(500).json({ error: 'Internal server error' });
    });
});

app.post('/users', async (req, res) => {
    const userRepository = AppDataSource.getRepository('user');
    const newuser = userRepository.create(req.body);
    const savedUser = await userRepository.save(newuser);
    res.status(201).json(savedUser);
});



app.put('/users/:id', async (req, res) => {
    const userRepository = AppDataSource.getRepository('user');
    const user = await userRepository.findOneBy({ id: parseInt(req.params.id) });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    userRepository.merge(user, req.body);
    const updatedUser = await userRepository.save(user);
    res.json(updatedUser);
});

app.delete('/users/:id', async (req, res) => {
    const userRepository = AppDataSource.getRepository('user');
    const user = await userRepository.findOneBy({ id: parseInt(req.params.id) });

if (!user) {
        return res.status(404).json({ error: 'User not found' });
}

    await userRepository.remove(user);
    res.status(204).send();
});

app.get('/users/search', async (req, res) => {
    const userRepository = AppDataSource.getRepository('user');
    const users = await userRepository.find({
        where: [
            { username: ILike(`%${req.query.q}%`) },
            { email: ILike(`%${req.query.q}%`) }
        ]
    });
    res.json(users);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});