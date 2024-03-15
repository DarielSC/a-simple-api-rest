import User from '../models/User'
import  jwt from 'jsonwebtoken'
import config  from '../config'
import Role from '../models/Role';

export const signUp = async (req, res) => {
  const { username, email, password, roles } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newUser = new User({
      username,
      email,
      password: await User.encryptPassword(password),
    });

    if (roles) {
      const foundRoles = await Role.find({ name: { $in: roles } });
      newUser.roles = foundRoles.map(role => role._id);
    } else {
      const role = await Role.findOne({ name: "user" });
      newUser.roles = [role._id]; // Asigna el rol por defecto de 'user'
    }

    const savedUser = await newUser.save();
    // Para evitar enviar información sensible, puedes excluir la contraseña y otros datos sensibles
    const userForResponse = {
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      roles: savedUser.roles,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    };

    const token = jwt.sign({ id: savedUser._id }, config.SECRET, {
      expiresIn: 86400 // 24 horas
    });

    // Envía una sola respuesta con el token y la información del usuario
    res.json({
      message: 'User registered successfully',
      user: userForResponse,
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating user" });
  }
};

 export const signIn = async (req, res) => {
    
  const userFound = await User.findOne({email: req.body.email}).populate('roles');

  if (!userFound) return res.status(400).json({message:"User not found."})

  
  const matchPassword = await User.comparePassword(req.body.password, userFound.password);

  if(!matchPassword) return  res.status(401).json({message:'Invalid password.'});

  const token = jwt.sign({id: userFound._id},config.SECRET ,{
    expiresIn: 86400
  })
  res.json({token})


 }