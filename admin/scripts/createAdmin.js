const mongoose = require('mongoose');
const Admin = require('../src/models/Admin');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const createDefaultAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pagbank', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Conectado ao MongoDB');

    // Verificar se já existe algum admin
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      console.log('⚠️  Já existem admins no banco de dados.');
      console.log('   Total de admins:', adminCount);
      process.exit(0);
    }

    // Criar admin padrão
    const defaultAdmin = new Admin({
      username: 'admin',
      email: 'admin@pagbank.com',
      password: 'admin123',
      role: 'superadmin'
    });

    await defaultAdmin.save();
    console.log('✅ Admin padrão criado com sucesso!');
    console.log('');
    console.log('📋 Credenciais de acesso:');
    console.log('   Usuário: admin');
    console.log('   Senha: admin123');
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error.message);
    process.exit(1);
  }
};

createDefaultAdmin();
