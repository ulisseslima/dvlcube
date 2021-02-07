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

insert into part2 (value, gender) values ('prematura', 1);
insert into part2 (value, gender) values ('prematuro', 2);
insert into part2 (value, gender) values ('hipnotizada', 1);
insert into part2 (value, gender) values ('hipnotizado', 2);
insert into part2 (value, gender) values ('mole', 0);
insert into part2 (value, gender) values ('de agulha', 0);
insert into part2 (value, gender) values ('molenga', 0);
insert into part2 (value, gender) values ('ambulante', 0);
insert into part2 (value, gender) values ('azul', 0);
insert into part2 (value, gender) values ('quadrada', 1);
insert into part2 (value, gender) values ('quadrado', 2);
insert into part2 (value, gender) values ('senoidal', 0);
insert into part2 (value, gender) values ('quebrada', 1);
insert into part2 (value, gender) values ('quebrado', 2);
insert into part2 (value, gender) values ('de jiló', 0);
insert into part2 (value, gender) values ('cara de mamão', 0);
insert into part2 (value, gender) values ('careca', 0);
insert into part2 (value, gender) values ('de rodinhas', 0);
insert into part2 (value, gender) values ('intragável', 0);
insert into part2 (value, gender) values ('bolha', 0);
insert into part2 (value, gender) values ('mal', 0);
insert into part2 (value, gender) values ('sem bago', 0);
insert into part2 (value, gender) values ('ululante', 0);
insert into part2 (value, gender) values ('furada', 1);
insert into part2 (value, gender) values ('furado', 2);
insert into part2 (value, gender) values ('marrom', 0);
insert into part2 (value, gender) values ('amassada', 1);
insert into part2 (value, gender) values ('amassado', 2);
insert into part2 (value, gender) values ('minguante', 0);
insert into part2 (value, gender) values ('cheia', 1);
insert into part2 (value, gender) values ('cheio', 2);
insert into part2 (value, gender) values ('elétrica', 1);
insert into part2 (value, gender) values ('elétrico', 2);
insert into part2 (value, gender) values ('sem rodinhas', 0);
insert into part2 (value, gender) values ('enferrujada', 1);
insert into part2 (value, gender) values ('enferrujado', 2);
insert into part2 (value, gender) values ('amarrada', 1);
insert into part2 (value, gender) values ('amarrado', 2);
insert into part2 (value, gender) values ('esverdeada', 1);
insert into part2 (value, gender) values ('esverdeado', 2);
insert into part2 (value, gender) values ('com gosto de salsicha', 0);
insert into part2 (value, gender) values ('animal', 0);
insert into part2 (value, gender) values ('do cabelo pixaim', 0);
insert into part2 (value, gender) values ('sem cabelo', 0);
insert into part2 (value, gender) values ('da montanha', 0);
insert into part2 (value, gender) values ('sem mochila', 0);
insert into part2 (value, gender) values ('suja', 1);
insert into part2 (value, gender) values ('sujo', 2);
insert into part2 (value, gender) values ('amarga', 1);
insert into part2 (value, gender) values ('amargo', 2);
insert into part2 (value, gender) values ('uvinha de mulher', 0);
insert into part2 (value, gender) values ('minecrafter', 0);
insert into part2 (value, gender) values ('de óculos', 0);
insert into part2 (value, gender) values ('sem óculos', 0);
insert into part2 (value, gender) values ('sem nariz', 0);
insert into part2 (value, gender) values ('sem maquiagem', 0);
insert into part2 (value, gender) values ('perdida', 1);
insert into part2 (value, gender) values ('perdido', 2);
insert into part2 (value, gender) values ('pif pif', 0);
insert into part2 (value, gender) values ('sem dedo', 0);
insert into part2 (value, gender) values ('cigana', 1);
insert into part2 (value, gender) values ('cigano', 2);

-- part 3
insert into part3 (value, gender) values ('amarela', 1);
insert into part3 (value, gender) values ('amarelo', 2);
insert into part3 (value, gender) values ('de taubaté', 0);

insert into part3 (value, gender) values ('bola bola', 0);
insert into part3 (value, gender) values ('gelada', 1);
insert into part3 (value, gender) values ('gelado', 2);
insert into part3 (value, gender) values ('sem dente', 0);
insert into part3 (value, gender) values ('vendedora de produtos jequiti', 1);
insert into part3 (value, gender) values ('vendedor da jequiti', 2);
insert into part3 (value, gender) values ('vendedora da avon', 1);
insert into part3 (value, gender) values ('vendedor da avon', 2);
insert into part3 (value, gender) values ('de raio laser', 0);
insert into part3 (value, gender) values ('mobile', 0);
insert into part3 (value, gender) values ('na noite', 0);
insert into part3 (value, gender) values ('noturno', 0);
insert into part3 (value, gender) values ('parecida com o sonic', 1);
insert into part3 (value, gender) values ('parecido com o sonic', 2);
insert into part3 (value, gender) values ('de skate', 0);
insert into part3 (value, gender) values ('vermelha', 1);
insert into part3 (value, gender) values ('vermelho', 2);
insert into part3 (value, gender) values ('madura', 1);
insert into part3 (value, gender) values ('maduro', 2);
insert into part3 (value, gender) values ('sem mãe', 0);
insert into part3 (value, gender) values ('sem pau', 0);
insert into part3 (value, gender) values ('incubada', 1);
insert into part3 (value, gender) values ('incubado', 2);
insert into part3 (value, gender) values ('no insulfilme', 0);
insert into part3 (value, gender) values ('vegana', 1);
insert into part3 (value, gender) values ('vegano', 2);
insert into part3 (value, gender) values ('vegetal', 0);
insert into part3 (value, gender) values ('com tomate seco', 0);
insert into part3 (value, gender) values ('parecida com a medusa', 1);
insert into part3 (value, gender) values ('parecido com a medusa', 2);
insert into part3 (value, gender) values ('perfurante', 0);
insert into part3 (value, gender) values ('voadora', 1);
insert into part3 (value, gender) values ('voador', 2);
insert into part3 (value, gender) values ('filhote de peppa pig', 0);
insert into part3 (value, gender) values ('jogadora de lol', 1);
insert into part3 (value, gender) values ('jogador de lol', 2);
insert into part3 (value, gender) values ('jogadora de minecraft', 1);
insert into part3 (value, gender) values ('jogador de minecraft', 2);
insert into part3 (value, gender) values ('no caixão', 0);
insert into part3 (value, gender) values ('sem caixão', 0);
insert into part3 (value, gender) values ('conservada', 1);
insert into part3 (value, gender) values ('conservado', 2);
insert into part3 (value, gender) values ('acabada', 1);
insert into part3 (value, gender) values ('acabado', 2);
insert into part3 (value, gender) values ('na superfície', 0);
insert into part3 (value, gender) values ('enterrada', 1);
insert into part3 (value, gender) values ('enterrado', 2);
insert into part3 (value, gender) values ('descascada', 1);
insert into part3 (value, gender) values ('descascado', 2);
insert into part3 (value, gender) values ('desencapada', 1);
insert into part3 (value, gender) values ('desencapado', 2);
insert into part3 (value, gender) values ('desenrolada', 1);
insert into part3 (value, gender) values ('desenrolado', 2);
insert into part3 (value, gender) values ('farpada', 1);
insert into part3 (value, gender) values ('farpado', 2);
insert into part3 (value, gender) values ('descalibrada', 1);
insert into part3 (value, gender) values ('descalibrado', 2);
insert into part3 (value, gender) values ('vazia', 1);
insert into part3 (value, gender) values ('vazio', 2);
insert into part3 (value, gender) values ('mal passada', 1);
insert into part3 (value, gender) values ('mal passado', 2);
insert into part3 (value, gender) values ('inacabada', 1);
insert into part3 (value, gender) values ('inacabado', 2);
insert into part3 (value, gender) values ('torta', 1);
insert into part3 (value, gender) values ('torto', 2);
insert into part3 (value, gender) values ('estraviada pelos correios', 1);
insert into part3 (value, gender) values ('estraviado pelos correios', 2);
insert into part3 (value, gender) values ('viajante', 0);
insert into part3 (value, gender) values ('congelada', 1);
insert into part3 (value, gender) values ('congelado', 2);
insert into part3 (value, gender) values ('desnutrida', 1);
insert into part3 (value, gender) values ('desnutrido', 2);
insert into part3 (value, gender) values ('polar', 0);
insert into part3 (value, gender) values ('mecânica', 1);
insert into part3 (value, gender) values ('mecânico', 2);
insert into part3 (value, gender) values ('desacoplada', 1);
insert into part3 (value, gender) values ('desacoplado', 2);
insert into part3 (value, gender) values ('marinha', 1);
insert into part3 (value, gender) values ('marinho', 2);
insert into part3 (value, gender) values ('terrestre', 0);
insert into part3 (value, gender) values ('aérea', 1);
insert into part3 (value, gender) values ('aéreo', 2);
insert into part3 (value, gender) values ('na autópsia', 0);
insert into part3 (value, gender) values ('da era feudal', 0);
insert into part3 (value, gender) values ('em 240p', 0);
insert into part3 (value, gender) values ('com gergelim', 0);
insert into part3 (value, gender) values ('meio amarga', 1);
insert into part3 (value, gender) values ('meio amargo', 2);
insert into part3 (value, gender) values ('parecida com o pikachu', 1);
insert into part3 (value, gender) values ('parecido com o pikachu', 2);
insert into part3 (value, gender) values ('deslizante', 0);
