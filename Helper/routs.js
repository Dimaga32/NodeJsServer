const path =require('path')
const fs = require('fs');
const ejs = require('ejs');
const createHelpPath = (page) => path.resolve(__dirname, `${page}.js`);
const Router =require(createHelpPath(`Router`))
const createPath = (page) => path.resolve(__dirname, 'pub', `${page}.ejs`);
const crypto = require('crypto');
const querystring = require('querystring');
const router = new Router() 
function Render(req, res, page, data = {}) {
    const filePath = createPath(page); 
    ejs.renderFile(filePath, data, (error, str) => {
        if (error) {
            console.error(`Ошибка рендеринга файла: ${filePath}`, error);
            res.statusCode = 500;
            res.end('Ошибка сервера');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(str);
        }
    });
}   

const  mongoose  = require('mongoose');
const User = require(path.join(__dirname, '..',`Models`,`user.js`));
const db=`mongodb+srv://Dimaga:Dd16141614@cluster0.oaswu.mongodb.net/persons?retryWrites=true&w=majority&appName=Cluster0`
mongoose
.connect(db)
.then( 
    (res)=>{
    console.log(`connected to db`)})
    .catch((error)=>{console.log(error)})
const users=[]

router.get('/users',(req,res)=>{
    User.find().then((users)=>{
    const modifiedUsers = users.map((user) => ({
    hash: user._id,
    id: user.id,
    name: user.name,
    about: user.about
    }));
    Render(req, res, 'users',{title:`App || Пользователи`,users: modifiedUsers})});
})

router.get('/create/user', (req, res) => {
    Render(req, res, 'createUser',{title:`App || Создать пользователя`});
});

router.post('/create/user', (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', () => {
        User.find().then((users)=>{
        const formData = querystring.parse(body); 
        console.log('Полученные данные:', formData);
        const id=users.length + 1
        const newUser = new User({ id: id, name: formData.name,about:formData.about })
        newUser.save()
        const hash = crypto.createHash('md5').update(String(users.length)).digest('hex');
        res.writeHead(302, { Location: `/user/hash/${id}/${hash}` });
        res.end()
    })});
});

router.get('/user/hash/:id/:hash', (req, res) => {
    Render(req, res, 'hash',{
        title: `App || ${req.params.hash}`,
        hash: req.params.hash,
        id: req.params.id,
    });
}); 
 
router.get('/user/info', (req, res,obj=false) => {
    Render(req, res, 'UserInfo',{title:`App || Информация пользователя`,user:obj,Error:false,});
}); 

router.post('/user/info', (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', () => {
        User.find().then((users)=>{
        const formData = querystring.parse(body); 
        const userId = parseInt(formData.Id, 10); 
        const user = users.find((u) => u.id == userId); 
        if (user) {
            Render(req, res, 'UserInfo', {
                title: `App || Информация пользователя`,
                user: user, 
                Error:false,
            })
        } else {
            Render(req, res, 'UserInfo', {
                title: `App || Информация пользователя`,
                user: false,
                Error:`Пользователя нет в базе данных`,
            });
        }})
    });
}); 

router.put('/user/info', (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    }); 
    req.on('end', () => {
        User.find().then((users)=>{
        const formData = JSON.parse(body); // Измените на JSON.parse
        const userId = parseInt(formData.id, 10); // используем formData.id, а не formData.Id
        const user = users.find((u) => u.id == userId); 
        console.log(user)
        if (user) {
            user.name = formData.name;  // Пример обновления
            user.about = formData.about; // Пример обновления
            user.save().then(()=>{console.log('Пользователь обновлен успешно')
                return true})
        } else {
            console.log(`Пользователь не найден`)
            return false
        }
    })});
});

router.get('/user:id', (req, res,obj=false,Error=false) => {
    Render(req, res, 'UserInfo',{title:`App || Информация пользователя`,user:obj,Error:Error});
}); 

router.get('/user/edit', (req, res) => {
    Render(req, res, 'UserEdit',{title:`App || Редактировать пользователя`});
});

router.get('/', (req, res) => {
    Render(req, res, 'index',{title:`App || Главная`});
});

module.exports=router 