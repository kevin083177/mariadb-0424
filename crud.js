const pool = require('./db');

function validateStudentId(studentId) {
  const studentIdRegex = /^[A-Z]\d{8}$/;
  return !(!studentId || !studentIdRegex.test(studentId))
}

async function insertStudent(conn, studentId, name, gender, email, department_id) {
  try {
    if (!validateStudentId(studentId)) {
      throw new Error('不正確的學號格式，必須為1位英文字母以及8位數字');
    }
  
    let sql = 'INSERT INTO STUDENT (Student_ID, Name, Gender, Email, Department_ID) VALUES (?, ?, ?, ?, ?)';
    await conn.query(sql, [studentId, name, gender, email, department_id]);
    console.log(`已新增一筆學號 ${studentId} 資料`);
    return true;
  } catch (error) {
    console.log("新增學生資料時發生錯誤: ", error.message);
    throw error;
  }
}

async function findStundentById(conn, studentId) {
  try {
    if (!validateStudentId(studentId)) {
      throw new Error('不正確的學號格式，必須為1位英文字母以及8位數字');
    }
    let sql = 'SELECT * FROM STUDENT WHERE Student_ID = ?';
    const rows = await conn.query(sql, [studentId]);
    if (rows.length === 0) {
      console.log(`查無學號 ${studentId} 的學生資料`);
      return null;
    } else {
      console.log("成功找到學生");
      return rows[0];
    }
  }
  catch (error) {
    console.error('查詢學生資料時發生錯誤:', error.message);
    throw error;
  }
};

async function updateStudent(conn, studentId, updateData) {
  try {
    if (!validateStudentId(studentId)) {
      throw new Error('不正確的學號格式，必須為1位英文字母以及8位數字');
    }

    const checkSql = 'SELECT 1 FROM STUDENT WHERE Student_ID = ?';
    const checkResult = await conn.query(checkSql, [studentId]);
    
    if (checkResult.length === 0) {
      console.log(`查無學號 ${studentId} 的學生資料`);
      return false;
    }

    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (key !== 'Student_ID' && updateData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      console.log('沒有提供任何需要更新的欄位');
      return false;
    }

    updateValues.push(studentId);
    
    let updateSql = `UPDATE STUDENT SET ${updateFields.join(', ')} WHERE Student_ID = ?`;
    const result = await conn.query(updateSql, updateValues);

  if (result.affectedRows > 0) {
      console.log(`已成功更新學號 ${studentId} 的學生資料`);
      return true;
    } else {
      console.log(`更新失敗`);
      return false;
    }
  } catch (error) {
    console.error('更新學生資料時發生錯誤:', error.message);
    throw error;
  }
};

async function deleteStudentById(conn, studentId) {
  try {
    if (!validateStudentId(studentId)) {
      throw new Error('不正確的學號格式，必須為1位英文字母以及8位數字');
    }

    const checkSql = 'SELECT 1 FROM STUDENT WHERE Student_ID = ?';
    const checkResult = await conn.query(checkSql, [studentId]);
    
    if (checkResult.length === 0) {
      console.log(`查無學號 ${studentId} 的學生資料`);
      return false;
    }

    const deleteSql = 'DELETE FROM STUDENT WHERE Student_ID = ?';
    const result = await conn.query(deleteSql, [studentId]);
    
    if (result.affectedRows > 0) 
      console.log(`已成功刪除學號 ${studentId} 的學生資料`); 
    else 
      console.log(`刪除失敗`);

  } catch (error) {
    console.error('刪除學生資料時發生錯誤:', error.message);
    throw error;
  }
}

async function basicCrud() {
  let conn;
  try {
    conn = await pool.getConnection();
    // 1. CREATE 新增
    await insertStudent(conn, 'S10810001', '王曉明', 'M', 'wang@example.com', 'CS001');

    // 2. SELECT 查詢
    let student = await findStundentById(conn, "S10810001");
    if (student) console.log(student);

    // 3. UPDATE 更新
    const updatedStudent = await updateStudent(conn, 'S10810001', {
      Name: '王大明',
      Email: 'WANG@example.com',
      Department_ID: 'MA001'
    });

    if (updatedStudent) {
      const updatedStudentData = await findStundentById(conn, 'S10810001');
      console.log(updatedStudentData);
    }

    // 4. DELETE 刪除
    await deleteStudentById(conn, 'S10810001');
    student = await findStundentById(conn, "S10810001");
    if (student) console.log(student);

  } catch (err) {
    console.error('操作失敗：', err);
  } finally {
    if (conn) conn.release();
  }
};

basicCrud();