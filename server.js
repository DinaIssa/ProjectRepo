require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const authMiddleware = require('./authmiddleware');
const petDb = require('./petDb');
const User = require('./users');
const { registerSchema } = require('./validation');
const Pet = require('./pets');  
const app = express();
const port = 3000;      

// first route
app.get("/", (req, res) => {
  res.send("Welcome to  Pet Veterinary Clinic");
});

app.use(express.json());

// new register 
app.post("/register", async (req, res) => {
  try{
const validation = registerSchema.safeParse(req.body);
if(!validation.success){
  return res.status(400).json({message: "Invalid input", errors: validation.error.issues,});
}

const {name, email, password} = validation.data;
const userRepository = petDb.getRepository(User);
const existingUser = await userRepository.findOne({where: {email}});
if(existingUser){
  return res.status(400).json({message: "Email is already registered"});
}

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = userRepository.create({name, email, password: hashedPassword});
  const savedUser  = await userRepository.save(newUser);
  const {password:_, ...userData} = savedUser;
  return res.status(201).json({message: "User registered successfully", user: userData});
}


catch(error){ return res.status(500).json({message: " server error", error: error.message});}

});

//login route
app.post("/login", async (req, res) => {
try{
  const {email, password} = req.body;
  if(!email || !password){
    return res.status(400).json({message: "Email and password are required"});
  }
  const userRepository = petDb.getRepository(User);
  const user = await userRepository.findOne({where: {email}});
  if(!user){
    return res.status(401).json({message: "Invalid email or password"});
  }

const isMatch = await bcrypt.compare(password, user.password);
if(!isMatch){
  return res.status(401).json({message: "Invalid email or password"});
} 
const token = jwt.sign({userId: user.id, email: user.email}, JWT_SECRET, {expiresIn: "7d"});
const {password:_, ...userData} = user;
return res.json({message: "Login successful", token, user: userData});

}
catch(error){ return res.status(500).json({message: " server error", error: error.message});
}
});

// auth me
app.get("/auth/me", authMiddleware, async (req, res) => {
  try{
    const userRepository = petDb.getRepository(User); 
    const user = await userRepository.findOne({where: {id: req.user.userId}});
    if(!user){
      return res.status(404).json({message: "User not found"});
    }
    const {password:_, ...userData} = user;
    return res.json({userData});
  }
  catch(error){ return res.status(500).json({message: " server error", error: error.message});
  }   
});

// create pet
app.post("/pets", authMiddleware, async (req, res) => {
  try{
    const {name, species, dateOfBirth} = req.body;
    if(!name || !species){
      return res.status(400).json({message: "Name and species are required"});
    }
    const petRepository = petDb.getRepository(Pet);
    const userRepository = petDb.getRepository(User);
    const owner = await userRepository.findOne({where: {id: req.user.userId}});
    if(!owner){
      return res.status(404).json({message: "Owner not found"});
    } 
    const newPet = petRepository.create({name, species, dateOfBirth, owner});
    const savedPet = await petRepository.save(newPet);
    return res.status(201).json({message: "Pet created successfully", pet: savedPet});
  } 
  catch(error){ return res.status(500).json({message: " server error", error: error.message});  
}
});

// get pets
app.get("/pets", authMiddleware, async (req, res) => {
  try{
    const petRepository = petDb.getRepository(Pet);
    const pets = await petRepository.find({where: {owner: {id: req.user.userId}}});
    return res.json(pets);
  }
  catch(error){ return res.status(500).json({message: " server error", error: error.message});
  }   
});


// get pet by id
app.get("/pets/:id", authMiddleware, async (req, res) => {
  try{
    const petRepository = petDb.getRepository(Pet);
    const petId =Number(req.params.id);
    if(!Number.isInteger(petId) || petId <= 0){
      return res.status(400).json({message: "Invalid pet ID"});
    }
    const pet = await petRepository.findOne({where: {id: petId, owner: {id: req.user.userId}}});
    if(!pet){
      return res.status(404).json({message: "Pet not found"});
    }
    return res.json(pet);
  }   
  catch(error){ return res.status(500).json({message: " server error", error: error.message});
  }
});

//update pet
app.put("/pets/:id", authMiddleware, async (req, res) => {
  try{
    const petRepository = petDb.getRepository(Pet);
    const petId = Number(req.params.id);
    const {name, species, dateOfBirth} = req.body;
    if(!Number.isInteger(petId) || petId <= 0){
      return res.status(400).json({message: "Invalid pet ID"});
    } 
    if(!name || !species){
      return res.status(400).json({message: "Name and species are required"});
    } 
    const pet = await petRepository.findOne({where: {id: petId, owner: {id: req.user.userId}}});
    if(!pet){
      return res.status(404).json({message: "Pet not found"});
    } 
    pet.name = name;
    pet.species = species;
    pet.dateOfBirth = dateOfBirth;  

    const updatedPet = await petRepository.save(pet);
    return res.json({message: "Pet updated successfully", pet: updatedPet});
  }
  catch(error){ return res.status(500).json({message: " server error", error: error.message});
  }
}); 

//delete pet
app.delete("/pets/:id", authMiddleware, async (req, res) => {
  try{
    const petRepository = petDb.getRepository(Pet);
    const petId = Number(req.params.id);
    if(!Number.isInteger(petId) || petId <= 0){
      return res.status(400).json({message: "Invalid pet ID"});     
    }
    const pet = await petRepository.findOne({where: {id: petId, owner: {id: req.user.userId}}});
    if(!pet){
      return res.status(404).json({message: "Pet not found"});
    }
    await petRepository.remove(pet);
    return res.json({message: "Pet deleted successfully"});
  }
  catch(error){ return res.status(500).json({message: " server error", error: error.message});
}});


//health route
app.get("/health", (req, res) => {
  res.status(200).json({ status:"success", message: "Pet Veterinary Clinic is running smoothly" });
});


petDb.initialize()
  .then(() => {
    console.log("Database connected successfully.");
   
    app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });


