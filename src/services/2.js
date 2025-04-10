import uni from 'uni-app'
uni.downloadFile({
    url: 'https://www.das-ai.com/open/api/v2/agent/file/download',
    method: 'POST',
    header: {
        'appKey': 'hengnaozYW3SnQJNy5hIzs2pp8w',
        'sign': '1744217819370dfrzD7S30OG7/ NoB7cyrzFuNjeLjIMdHO7bPZZ9K5 + M=',
        'Accept': 'application/octet-stream',
        'Content-Type': 'application/json'
    },
    data: JSON.stringify({ file: '算法设计.docx < c3fb5b69 - 9683 - 4d75 - a1a6 - 5dbd1af83770 >' }),
    success: (res) => {
        console.log(res);
    }
});