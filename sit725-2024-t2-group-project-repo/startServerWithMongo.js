let express = require('express');
let app = express();
const argon2 = require('argon2');
const User = require('./models/user');
const UserLinks = require('./models/userLinks');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb') // Optional if using express-async-handler

// const uri = "mongodb://localhost:27017";
const uri = "mongodb+srv://wandabwafaith:Mukongolo2472@cluster0.anov8lm.mongodb.net/"
// const uri = "mongodb+srv://s223749059:2fICYltL4sfxoG1M@cluster0.tjcoayf.mongodb.net/"
let port = process.env.port || 3000;

app.use(express.static(__dirname + '/public'))
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function runDBConnection() {
    try {
        await client.connect();
        console.log("DB connected");
    } catch(ex) {
        console.error(ex);
    }
}

app.get('/', function (req,res) {
    res.render('indexMongo.html');
});

app.get('/login', (req, res) => {
    res.render('login.html');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).send('Invalid username or password');
    }
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
        return res.status(401).send('Invalid username or password');
    }
    // Create and send an authentication token
    const token = createAuthToken(user);
    res.status(200).send({ token });
});

app.get('/users', async (req, res) => {
    try{
        const users = await User.find({}).sort({username:1}).toArray();
        if ((await User.countDocuments({})) === 0) {
            return res.status(401).send("No users found.");
        }
        res.status(200).send({users});
    }catch(err){
        return res.status(400).json({ error: err.message });
    }   
});

app.post('/user', async (req, res) => {
    const { username } = req.body;
    try{
        const user = await User.findOne({username});
        if (!user) {
            return res.status(401).send('Invalid username');
        }
        res.status(200).send({user});
    }catch(err){
        return res.status(400).json({ error: err.message });
    }   
});

app.post('/userlinks', async (req, res) => {
    const { username } = req.body;
    try{
        // Check if username is not valid
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            throw new Error('Username does not exist');
        }
        // fetch the user's social media links
        const userLinks = await UserLinks.find({username}).sort({platform: 1}).toArray();
        res.status(200).send({userLinks});
    }catch(err){
        return res.status(400).json({ error: err.message });
    }   
});

app.post('/userlink', async (req, res) => {
    const { id  } = req.body;
    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
        console.error("Invalid ObjectId format:", id);
        return res.status(400).json({ error: 'Invalid ID format.' });
    }
    const objectId = new ObjectId(id);
    console.log("Converted ObjectId:",objectId);
    try{
        // Check if username is not valid
        const userLink = await UserLinks.findOne({ _id: objectId });
        if (!userLink) {
            throw res.status(404).json({ error: 'Link does not exist.' });
        }
        // fetch the user's social media links
        res.status(200).send({userLink});
    }catch(err){
        return res.status(400).json({ error: err.message });
    }   
});

app.get('/register', (req, res) => {
    res.render('register.html');
});
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try{
        // Check for missing fields
        if (!username || !email || !password) {
            throw new Error('Username, email, and password are required.');
        }
    
        // Check if username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new Error('Username already exists');
        }
        // Hash the password
        const hashedPassword = await argon2.hash(password);
        // Create a new user
        await User.insertOne({
            username,
            email,
            password: hashedPassword
        });
        res.status(200).send({'message':'Registration successful'});
    }catch(err){
        return res.status(400).json({ error: err.message }); // Use JSON for structured response
        
    }
});

app.post('/addSocialMedia', async (req, res) => {
    const { username, platform, link } = req.body;
    try{
        // Check for missing fields
        if (!username || !link) {
            throw new Error('Username and link are required.');
        }
    
        // Check if username is not valid
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            throw new Error('Username does not exist');
        }
        // Create a new user social media link
        await UserLinks.insertOne({
            username,
            platform,
            link
        });
        res.status(200).send({'message':'Added social media link'});
    }catch(err){
        return res.status(400).json({ error: err.message }); // Use JSON for structured response
        
    }
});

app.post('/updateSocialMedia', async (req, res) => {
    const { username, platform, link } = req.body;
    try{
        // Check for missing fields
        if (!username || !link) {
            throw new Error('Username and link are required.');
        }
    
        // Check if username is not valid
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            throw new Error('Username does not exist');
        }
        // Create a new user social media link
        await UserLinks.updateOne(
            {
            username
            },
            {
                $set: {platform, link}                
            },
            { 
                upsert: true 
            }
        );
        res.status(200).send({'message':'Updated social media link'});
    }catch(err){
        return res.status(400).json({ error: err.message }); // Use JSON for structured response
        
    }
});

const jwt = require('jsonwebtoken');
const secretKey = "GroupKey";
function createAuthToken(user) {
    const payload = { userId: user._id };
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

app.listen(port, ()=>{
    console.log('express server started');
    runDBConnection();
});
