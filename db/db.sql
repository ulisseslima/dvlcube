create table part1 (
    id serial PRIMARY KEY,
    value text unique not null,
    gender integer,
    lang integer not null default 0,
    created timestamp not null default now()
);

create table part2 (
    id serial PRIMARY KEY,
    value text unique not null,
    gender integer,
    lang integer not null default 0,
    created timestamp not null default now()
);

create table part3 (
    id serial PRIMARY KEY,
    value text unique not null,
    gender integer,
    lang integer not null default 0,
    created timestamp not null default now()
);

insert into part1 (value, gender) values ('sua bola', 1);
insert into part1 (value, gender) values ('sua mula', 1);
insert into part1 (value, gender) values ('sua égua', 1);
insert into part1 (value, gender) values ('sua tartaruga', 1);
insert into part1 (value, gender) values ('filho duma girafa', 1);
insert into part1 (value, gender) values ('sua pamonha', 1);
insert into part1 (value, gender) values ('sua múmia', 1);
insert into part1 (value, gender) values ('sua cadeira', 1);
insert into part1 (value, gender) values ('ratazana', 1);
insert into part1 (value, gender) values ('barata', 1);
insert into part1 (value, gender) values ('batata', 1);
insert into part1 (value, gender) values ('lua', 1);
insert into part1 (value, gender) values ('meia', 1);
insert into part1 (value, gender) values ('vespa', 1);
insert into part1 (value, gender) values ('cobra', 1);
insert into part1 (value, gender) values ('sua pokébola', 1);
insert into part1 (value, gender) values ('sua anta', 1);
insert into part1 (value, gender) values ('sua magikarp', 1);
insert into part1 (value, gender) values ('sua pedra', 1);
insert into part1 (value, gender) values ('êê tartaruga ninja', 1);
insert into part1 (value, gender) values ('sua pipa', 1);
insert into part1 (value, gender) values ('sua bananinha', 1);
insert into part1 (value, gender) values ('sua banana', 1);
insert into part1 (value, gender) values ('galinha pintadinha', 1);
insert into part1 (value, gender) values ('sua sereia fora dágua', 1);
insert into part1 (value, gender) values ('paçoca', 1);

insert into part1 (value, gender) values ('seu tororó', 2);
insert into part1 (value, gender) values ('esqueleto', 2);
insert into part1 (value, gender) values ('seu picolé', 2);
insert into part1 (value, gender) values ('seu cone', 2);
insert into part1 (value, gender) values ('seu ornitorrinco', 2);
insert into part1 (value, gender) values ('seu porco espinho', 2);
insert into part1 (value, gender) values ('seu pickles', 2);
insert into part1 (value, gender) values ('seu manequim', 2);
insert into part1 (value, gender) values ('seu diabo', 2);
insert into part1 (value, gender) values ('seu peixe', 2);
insert into part1 (value, gender) values ('enfeite de oferenda', 2);
insert into part1 (value, gender) values ('enfeite de presente', 2);
insert into part1 (value, gender) values ('enfeite de arroz', 2);
insert into part1 (value, gender) values ('seu defunto', 2);
insert into part1 (value, gender) values ('seu caralho', 2);
insert into part1 (value, gender) values ('seu filhote de rato', 2);
insert into part1 (value, gender) values ('seu pikachu', 2);
insert into part1 (value, gender) values ('seu pokémon', 2);

-- part 2
insert into part2 (value, gender) values ('de bolinhas', 0);
insert into part2 (value, gender) values ('manco', 2);
insert into part2 (value, gender) values ('manca', 1);
insert into part2 (value, gender) values ('molhado', 2);
insert into part2 (value, gender) values ('molhada', 1);

-- prematura|prematuro
-- hipnotizada|hipnotizado
-- mole|mole
-- de agulha|de agulha
-- molenga|molenga
-- ambulante|ambulante
-- azul|azul
-- quadrada|quadrado
-- senoidal|senoidal
-- quebrada|quebrado
-- de jiló|de jiló
-- cara de mamão|cara de mamão
-- careca|careca
-- de rodinhas|de rodinhas
-- intragável|intragável
-- bolha|bolha
-- mal|mal
-- sem bago|sem bago
-- ululante|ululante
-- furada|furado
-- marrom|marrom
-- amassada|amassado
-- minguante|minguante
-- cheia|cheio
-- elétrica|elétrico
-- sem rodinhas|sem rodinhas
-- enferrujada|enferrujado
-- amarrada|amarrado
-- esverdeada|esverdeado
-- com gosto de salsicha|com gosto de salsicha
-- animal|animal
-- do cabelo pixaim|do cabelo pixaim
-- sem cabelo|sem cabelo
-- da montanha|da montanha
-- sem mochila|sem mochila
-- suja|sujo
-- amarga|amargo
-- uvinha de mulher|uvinha de mulher
-- minecrafter|minecrafter
-- de óculos|de óculos
-- sem óculos|sem óculos
-- sem nariz|sem nariz
-- sem maquiagem|sem maquiagem
-- perdida|perdido
-- pif pif pif|pif pif pif
-- sem dedo|sem dedo
-- cigana|cigano

-- part 3
insert into part3 (value, gender) values ('amarela', 1);
insert into part3 (value, gender) values ('amarelo', 2);
insert into part3 (value, gender) values ('de taubaté', 0);

-- gelada|gelado
-- sem dente|sem dente
-- vendedora de produtos jequiti|vendedora de produtos jequiti
-- vendedora da avon|vendedor da avon
-- de raio laser|de raio laser
-- mobile|mobile
-- na noite|na noite
-- parecida com o sonic|parecido com o sonic
-- de skate|de skate
-- vermelha|vermelho
-- madura|maduro
-- sem mãe|sem mãe
-- sem pau|sem pau
-- incubada|incubado
-- no insulfilme|no insulfilme
-- vegana|vegano
-- vegetal|vegetal
-- com tomate seco|com tomate seco
-- parecido com a medusa|parecido com a medusa
-- perfurante|perfurante
-- voadora|voador
-- filhote de peppa pig
-- jogadora de lol|jogador de lol
-- jogadora de minecraft|jogador de minecraft
-- no caixão|no caixão
-- sem caixão|sem caixão
-- conservada|conservado
-- acabada|acabado
-- na superfície|na superfície
-- enterrada|enterrado
-- descascada|descascado
-- desencapada|desencapado
-- desenrolada|desenrolado
-- farpada|farpado
-- descalibrada|descalibrado
-- vazia|vazio
-- mal passada|mal passado
-- inacabada|inacabado
-- torta|torto
-- estraviada pelos correios|estraviada pelos correios
-- viajante|viajante
-- congelada|congelado
-- desnutrida|desnutrido
-- polar|polar
-- mecânica|mecânico
-- desacoplada|desacoplado
-- marinha|marinho
-- terrestre|terrestre
-- aérea|aérea
-- na autópsia|na autópsia
-- da era feudal|da era feudal
-- em 240p|em 240p
-- com gergelim|com gergelim
-- meio amarga|meio amargo
-- parecida com o pikachu|parecido com o pikachu
-- deslizante|deslizante
