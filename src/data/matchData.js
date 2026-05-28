export const FLAGS = {
  "México":"🇲🇽","África do Sul":"🇿🇦","Coreia do Sul":"🇰🇷","Tchéquia":"🇨🇿",
  "Canadá":"🇨🇦","Bósnia":"🇧🇦","Catar":"🇶🇦","Suíça":"🇨🇭",
  "Brasil":"🇧🇷","Marrocos":"🇲🇦","Haiti":"🇭🇹","Escócia":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "EUA":"🇺🇸","Paraguai":"🇵🇾","Austrália":"🇦🇺","Turquia":"🇹🇷",
  "Alemanha":"🇩🇪","Curaçao":"🇨🇼","C. Marfim":"🇨🇮","Equador":"🇪🇨",
  "Holanda":"🇳🇱","Japão":"🇯🇵","Suécia":"🇸🇪","Tunísia":"🇹🇳",
  "Bélgica":"🇧🇪","Egito":"🇪🇬","Irã":"🇮🇷","N. Zelândia":"🇳🇿",
  "Espanha":"🇪🇸","Cabo Verde":"🇨🇻","A. Saudita":"🇸🇦","Uruguai":"🇺🇾",
  "França":"🇫🇷","Senegal":"🇸🇳","Iraque":"🇮🇶","Noruega":"🇳🇴",
  "Argentina":"🇦🇷","Argélia":"🇩🇿","Áustria":"🇦🇹","Jordânia":"🇯🇴",
  "Portugal":"🇵🇹","RD Congo":"🇨🇩","Uzbequistão":"🇺🇿","Colômbia":"🇨🇴",
  "Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croácia":"🇭🇷","Gana":"🇬🇭","Panamá":"🇵🇦",
};

export const ALL_TEAMS = Object.keys(FLAGS).sort((a,b)=>a.localeCompare(b));

export const GROUPS = {
  A:{teams:["México","África do Sul","Coreia do Sul","Tchéquia"],matches:[
    {id:"A1",home:"México",away:"África do Sul",round:1,date:"11 Jun"},{id:"A2",home:"Coreia do Sul",away:"Tchéquia",round:1,date:"11 Jun"},
    {id:"A3",home:"Tchéquia",away:"África do Sul",round:2,date:"18 Jun"},{id:"A4",home:"México",away:"Coreia do Sul",round:2,date:"18 Jun"},
    {id:"A5",home:"México",away:"Tchéquia",round:3,date:"25 Jun"},{id:"A6",home:"África do Sul",away:"Coreia do Sul",round:3,date:"25 Jun"},
  ]},
  B:{teams:["Canadá","Bósnia","Catar","Suíça"],matches:[
    {id:"B1",home:"Canadá",away:"Bósnia",round:1,date:"12 Jun"},{id:"B2",home:"Catar",away:"Suíça",round:1,date:"13 Jun"},
    {id:"B3",home:"Suíça",away:"Bósnia",round:2,date:"18 Jun"},{id:"B4",home:"Canadá",away:"Catar",round:2,date:"18 Jun"},
    {id:"B5",home:"Suíça",away:"Canadá",round:3,date:"24 Jun"},{id:"B6",home:"Bósnia",away:"Catar",round:3,date:"24 Jun"},
  ]},
  C:{teams:["Brasil","Marrocos","Haiti","Escócia"],matches:[
    {id:"C1",home:"Brasil",away:"Marrocos",round:1,date:"13 Jun"},{id:"C2",home:"Haiti",away:"Escócia",round:1,date:"13 Jun"},
    {id:"C3",home:"Escócia",away:"Marrocos",round:2,date:"19 Jun"},{id:"C4",home:"Brasil",away:"Haiti",round:2,date:"19 Jun"},
    {id:"C5",home:"Escócia",away:"Brasil",round:3,date:"24 Jun"},{id:"C6",home:"Haiti",away:"Marrocos",round:3,date:"24 Jun"},
  ]},
  D:{teams:["EUA","Paraguai","Austrália","Turquia"],matches:[
    {id:"D1",home:"EUA",away:"Paraguai",round:1,date:"12 Jun"},{id:"D2",home:"Austrália",away:"Turquia",round:1,date:"13 Jun"},
    {id:"D3",home:"EUA",away:"Austrália",round:2,date:"19 Jun"},{id:"D4",home:"Turquia",away:"Paraguai",round:2,date:"19 Jun"},
    {id:"D5",home:"EUA",away:"Turquia",round:3,date:"25 Jun"},{id:"D6",home:"Paraguai",away:"Austrália",round:3,date:"25 Jun"},
  ]},
  E:{teams:["Alemanha","Curaçao","C. Marfim","Equador"],matches:[
    {id:"E1",home:"Alemanha",away:"Curaçao",round:1,date:"14 Jun"},{id:"E2",home:"C. Marfim",away:"Equador",round:1,date:"14 Jun"},
    {id:"E3",home:"Alemanha",away:"C. Marfim",round:2,date:"20 Jun"},{id:"E4",home:"Equador",away:"Curaçao",round:2,date:"20 Jun"},
    {id:"E5",home:"Alemanha",away:"Equador",round:3,date:"25 Jun"},{id:"E6",home:"Curaçao",away:"C. Marfim",round:3,date:"25 Jun"},
  ]},
  F:{teams:["Holanda","Japão","Suécia","Tunísia"],matches:[
    {id:"F1",home:"Holanda",away:"Japão",round:1,date:"14 Jun"},{id:"F2",home:"Suécia",away:"Tunísia",round:1,date:"14 Jun"},
    {id:"F3",home:"Holanda",away:"Suécia",round:2,date:"20 Jun"},{id:"F4",home:"Tunísia",away:"Japão",round:2,date:"20 Jun"},
    {id:"F5",home:"Holanda",away:"Tunísia",round:3,date:"25 Jun"},{id:"F6",home:"Japão",away:"Suécia",round:3,date:"25 Jun"},
  ]},
  G:{teams:["Bélgica","Egito","Irã","N. Zelândia"],matches:[
    {id:"G1",home:"Bélgica",away:"Egito",round:1,date:"15 Jun"},{id:"G2",home:"Irã",away:"N. Zelândia",round:1,date:"15 Jun"},
    {id:"G3",home:"Bélgica",away:"Irã",round:2,date:"21 Jun"},{id:"G4",home:"N. Zelândia",away:"Egito",round:2,date:"21 Jun"},
    {id:"G5",home:"Bélgica",away:"N. Zelândia",round:3,date:"26 Jun"},{id:"G6",home:"Egito",away:"Irã",round:3,date:"26 Jun"},
  ]},
  H:{teams:["Espanha","Cabo Verde","A. Saudita","Uruguai"],matches:[
    {id:"H1",home:"Espanha",away:"Cabo Verde",round:1,date:"15 Jun"},{id:"H2",home:"A. Saudita",away:"Uruguai",round:1,date:"15 Jun"},
    {id:"H3",home:"Espanha",away:"A. Saudita",round:2,date:"21 Jun"},{id:"H4",home:"Uruguai",away:"Cabo Verde",round:2,date:"21 Jun"},
    {id:"H5",home:"Espanha",away:"Uruguai",round:3,date:"26 Jun"},{id:"H6",home:"Cabo Verde",away:"A. Saudita",round:3,date:"26 Jun"},
  ]},
  I:{teams:["França","Senegal","Iraque","Noruega"],matches:[
    {id:"I1",home:"França",away:"Senegal",round:1,date:"16 Jun"},{id:"I2",home:"Iraque",away:"Noruega",round:1,date:"16 Jun"},
    {id:"I3",home:"França",away:"Iraque",round:2,date:"22 Jun"},{id:"I4",home:"Noruega",away:"Senegal",round:2,date:"22 Jun"},
    {id:"I5",home:"França",away:"Noruega",round:3,date:"27 Jun"},{id:"I6",home:"Senegal",away:"Iraque",round:3,date:"27 Jun"},
  ]},
  J:{teams:["Argentina","Argélia","Áustria","Jordânia"],matches:[
    {id:"J1",home:"Argentina",away:"Argélia",round:1,date:"16 Jun"},{id:"J2",home:"Áustria",away:"Jordânia",round:1,date:"16 Jun"},
    {id:"J3",home:"Argentina",away:"Áustria",round:2,date:"22 Jun"},{id:"J4",home:"Jordânia",away:"Argélia",round:2,date:"22 Jun"},
    {id:"J5",home:"Argentina",away:"Jordânia",round:3,date:"27 Jun"},{id:"J6",home:"Argélia",away:"Áustria",round:3,date:"27 Jun"},
  ]},
  K:{teams:["Portugal","RD Congo","Uzbequistão","Colômbia"],matches:[
    {id:"K1",home:"Portugal",away:"RD Congo",round:1,date:"17 Jun"},{id:"K2",home:"Uzbequistão",away:"Colômbia",round:1,date:"17 Jun"},
    {id:"K3",home:"Portugal",away:"Uzbequistão",round:2,date:"23 Jun"},{id:"K4",home:"Colômbia",away:"RD Congo",round:2,date:"23 Jun"},
    {id:"K5",home:"Portugal",away:"Colômbia",round:3,date:"27 Jun"},{id:"K6",home:"RD Congo",away:"Uzbequistão",round:3,date:"27 Jun"},
  ]},
  L:{teams:["Inglaterra","Croácia","Gana","Panamá"],matches:[
    {id:"L1",home:"Inglaterra",away:"Croácia",round:1,date:"17 Jun"},{id:"L2",home:"Gana",away:"Panamá",round:1,date:"17 Jun"},
    {id:"L3",home:"Inglaterra",away:"Gana",round:2,date:"23 Jun"},{id:"L4",home:"Panamá",away:"Croácia",round:2,date:"23 Jun"},
    {id:"L5",home:"Inglaterra",away:"Panamá",round:3,date:"26 Jun"},{id:"L6",home:"Croácia",away:"Gana",round:3,date:"26 Jun"},
  ]},
};

export const ALL_MATCHES = Object.entries(GROUPS).flatMap(([g,d])=>d.matches.map(m=>({...m,group:g})));
