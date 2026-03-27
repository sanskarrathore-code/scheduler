const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const BINARY = path.join(__dirname, '../scheduler');

const runCmd = (args) => {
  return new Promise((resolve, reject) => {
    exec(`${BINARY} ${args}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return reject(error);
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        resolve({ raw: stdout });
      }
    });
  });
};

app.get('/api/assignments', async (req, res) => {
  try {
    const data = await runCmd('--list-assignments');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/assignments', async (req, res) => {
  const { name, date, h, m, completion } = req.body;
  try {
    const data = await runCmd(`--add-assignment "${name}" "${date}" ${h} ${m} ${completion}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/assignments/:id', async (req, res) => {
  const { id } = req.params;
  const { completion } = req.body;
  try {
    const data = await runCmd(`--update-assignment ${id} ${completion}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/assignments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await runCmd(`--remove-assignment ${id}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/exams', async (req, res) => {
  try {
    const data = await runCmd('--list-exams');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/exams', async (req, res) => {
  const { subject, date, h, m } = req.body;
  try {
    const data = await runCmd(`--add-exam "${subject}" "${date}" ${h} ${m}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/exams/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await runCmd(`--remove-exam ${id}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/exams/:id/topics', async (req, res) => {
  const { id } = req.params;
  const { name, weightage } = req.body;
  try {
    const data = await runCmd(`--add-topic ${id} "${name}" ${weightage}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/exams/:id/topics/:tidx/toggle', async (req, res) => {
  const { id, tidx } = req.params;
  try {
    const data = await runCmd(`--toggle-topic ${id} ${tidx}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/exams/:id/topics/:tidx', async (req, res) => {
  const { id, tidx } = req.params;
  try {
    const data = await runCmd(`--remove-topic ${id} ${tidx}`);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
