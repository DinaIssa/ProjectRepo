// استدعاء المكتبات
const express = require('express');
const path = require('path');
const fs = require('fs');

// عمل الابليكيش
const app = express();

// استخدام الميدل وير لتحليل البيانات بصيغة JSON
// الاكسبريس يفهم الجيسون بتاعة البودي الجاية
app.use(express.json());

// تحديد مسار الملف اللي هيتخزن فيه البيانات
const filePath = path.join(__dirname, 'user.json');
const port = 3000;


// post
// اضافة مستخدم جديد
app.post('/api/users', (req, res) => {

    // استلام البيانات من البودي
    const { name, email } = req.body; 

    //  بنقرأ الملف الأول قبل أي كتابة
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading file' });
        }

        // بنحول النص اللي اتأخد من الملف لـ جيسون اراي الجافا نفهمها
        const users = JSON.parse(data);

        // بنضيف المستخدم الجديد للاراى  بيونيك اي دي
const newUser = { id: Date.now().toString(), name, email };
     
users.push(newUser);

fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error saving data' });
            }

     res.status(201).json({ message: `User added successfully!`, user: newUser });
        });
    });       

});


// get
app.get('/api/users', (_, res) => {
    // بنقرأ الملف ونرجع كل البيانات اللي فيه
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading file' });
        }

        // تحويل النص لـجيسون  وإرجاعه للعميل
        const users = JSON.parse(data);
        res.status(200).json(users);
    });
});



// delete
app.delete('/api/users/:id', (req, res) => {
    // بنجيب ال اي دي  من ال بارا
        const { id } = req.params;

    //  بنقرأ الملف الأول
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading file' });
        }

        const users = JSON.parse(data);

        // 
            const filteredUsers = users.filter(user => user.id !== id);

        // فيلتر بنعمل تصفية هات كل النايس اللي الاي دي مش نفس الاي دي المطلوب
        if (users.length === filteredUsers.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        //  بنحفظ القائمة الجديدة بعد ما الشخص اتحذف منها
        fs.writeFile(filePath, JSON.stringify(filteredUsers, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error saving data' });
            }

            res.status(200).json({ message: 'User deleted successfully!' });
        });
    });
});


//update - put
app.put('/api/users/:id', (req, res) => {
    //  بناخد الـ اي دي من اللينك
    const { id } = req.params;
    
    //  بناخد البيانات الجديدة اللي محتاجين نعدلها
    const { name, email } = req.body;

    //  بنقرأ الملف الأول
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading file' });
        }

        const users = JSON.parse(data);

        // نبحث عن مكان الانديكس المستخدم جوه الاراي 
        const userIndex = users.findIndex(user => user.id === id);

        // لو رجع -1 معناها إن الشخص ده مش موجود في الملف
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        // بنعدل بيانات العنصر في المكان المظبوط بتاعه
        users[userIndex] = { id, name, email };

        //  بنحفظ الملف من جديد بعد التعديل
        fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error saving data' });
            }

            res.status(200).json({ message: 'User updated successfully  !', user: users[userIndex] });
        });
    });
});




// تشغيل الكود
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});