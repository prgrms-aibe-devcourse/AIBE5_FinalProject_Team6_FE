import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "id: 'app-1',",
  "id: 'app-1',\n    businessRegistrationNumber: '123-45-67890',\n    ceoName: '박혁거세',"
);
code = code.replace(
  "id: 'app-2',",
  "id: 'app-2',\n    businessRegistrationNumber: '234-56-78901',\n    ceoName: '이순신',"
);
code = code.replace(
  "id: 'app-3',",
  "id: 'app-3',\n    businessRegistrationNumber: '345-67-89012',\n    ceoName: '홍길동',"
);

fs.writeFileSync('src/App.tsx', code);
