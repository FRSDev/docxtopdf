const express = require("express");

const bodyParser = require("body-parser");

const libre = require("libreoffice-convert");

const fs = require("fs");

const path = require("path");

var outputFilePath;

const multer = require("multer");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

app.use(express.static("public"));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/docxtopdfdemo", (req, res) => {
  res.render("docxtopdfdemo", { title: "DOCX to PDF Converter" });
});

const docxtopdfdemo = function (req, file, callback) {
  var ext = path.extname(file.originalname);
  if (ext !== ".docx" && ext !== ".doc") {
    console.log("Entrou no Erro")
    return callback("This Extension is not Supported");
  }
  callback(null, true);
};



const docxtopdfdemoupload = multer({
  storage: storage,
  fileFilter: docxtopdfdemo,
});

app.post(
  '/docxtopdfdemo',
  docxtopdfdemoupload.single("file"),
  (req, res) => {
    if (req.file) {
      console.log("Chegue até aqui!")
      console.log(req.file.path);

      const file = fs.readFileSync(req.file.path);
      outputFilePath = Date.now() + "output.pdf";

      libre.convert(file, ".pdf", undefined, (err, done) => {
        if (err) {
          fs.unlinkSync(req.file.path);
          fs.unlinkSync(outputFilePath);
          res.send("some error taken place in conversion process");
        }
        fs.writeFileSync(outputFilePath, done);
        res.download(outputFilePath, (err) => {
          if (err) {
            fs.unlinkSync(req.file.path);
            fs.unlinkSync(outputFilePath);
            res.send("some error taken place in downloading the file");
          }
          fs.unlinkSync(req.file.path);
          fs.unlinkSync(outputFilePath);
          console.log("Finalizado!")
        });
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});