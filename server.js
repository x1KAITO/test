const express = require('express');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
const dataFile = path.join(__dirname, 'votes.json');

function loadVotes() {
  try {
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, JSON.stringify({ clean: 0, notClean: 0 }));
    }
    const data = fs.readFileSync(dataFile);
    return JSON.parse(data);
  } catch (error) {
    console.error('โหลดไฟล์โหวตล้มเหลว:', error);
    return { clean: 0, notClean: 0 };
  }
}

function saveVotes(votes) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(votes));
  } catch (error) {
    console.error('บันทึกไฟล์โหวตล้มเหลว:', error);
  }
}

app.get('/votes', (req, res) => {
  const votes = loadVotes();
  res.json(votes);
});

app.post('/vote', (req, res) => {
  const { choice } = req.body;
  const voted = req.cookies.voted;

  if (voted) {
    return res.status(400).json({ message: 'คุณโหวตไปแล้วนะเพื่อน! ไม่สามารถโหวตซ้ำได้' });
  }

  if (choice !== 'clean' && choice !== 'notClean') {
    return res.status(400).json({ message: 'เลือกผิดทางแล้ว! กรุณาเลือกใหม่' });
  }

  let votes = loadVotes();
  votes[choice]++;
  saveVotes(votes);

  res.cookie('voted', 'true', { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true });
  res.json({ message: 'ขอบคุณที่โหวตนะเพื่อน!', votes });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
