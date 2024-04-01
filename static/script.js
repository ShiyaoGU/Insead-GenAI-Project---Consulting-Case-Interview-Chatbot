function submitCase() {
    const geography = document.getElementById('geography').value;
    const caseType = document.getElementById('caseType').value; // 修改这里以匹配HTML中的ID
    const industry = document.getElementById('industry').value;
    const difficulty = document.getElementById('difficulty').value;

    // 检查所有字段是否已填写
    if (!geography || !caseType || !industry || !difficulty) {
        alert('请填写所有字段后再提交。');
        return; // 如果任何字段未填写则停止函数
    }
    
    // 发送数据到服务器
    fetch('http://localhost:5000/submit-case', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            geography: geography,
            caseType: caseType,
            industry: industry,
            difficulty: difficulty,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // 在这里处理响应数据
        // 保存选择到localStorage
        localStorage.setItem('preferences', JSON.stringify({
            geography: geography,
            caseType: caseType,
            industry: industry,
            difficulty: difficulty,
        }));

        // 重定向到聊天页面
        window.location.href = 'chat.html';
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('提交失败，请检查网络连接并重试。');
    });
}

function goToHome() {
    window.location.href = '/';
}