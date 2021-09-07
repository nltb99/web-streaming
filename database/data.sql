use web_streaming;

INSERT INTO users(username,password,nickname,token,fullname,email,role_user) VALUES
('bao','$2b$10$In1XOFBZCEreClBzDcG3ieOcKUIIslMzYXDNwYavjQz4DB/qxQ.H2','nltbao',100,'Nguyễn Lê Tiến Bảo','baonltps11095@fpt.edu.vn','VIEWER'),
('mkvien','$2b$10$In1XOFBZCEreClBzDcG3ieOcKUIIslMzYXDNwYavjQz4DB/qxQ.H2','mkvien',0,'Maj Kĩ Ziễn','asd@gmail.com','VIEWER'),
('khoi','$2b$10$In1XOFBZCEreClBzDcG3ieOcKUIIslMzYXDNwYavjQz4DB/qxQ.H2','khoi',0,'Nguyễn Minh Khôi','asd@gmail.com','VIEWER'),
('an','$2b$10$In1XOFBZCEreClBzDcG3ieOcKUIIslMzYXDNwYavjQz4DB/qxQ.H2','an',0,'Nguyễn Trường An','asd@gmail.com','VIEWER');

-- Tags
INSERT INTO tags(name) VALUES
('English'),
('Moba'),
('Action'),
('Horror'),
('FPS'),
('LOL'),
('Vietnam'),
('Korean'),
('FreeTalk'),
('Mobile Game'),
('Sports Game'),
('Tốc Chiến');

--------------
-- options_purchase
INSERT INTO options_purchase(quantity,promotion) VALUES
(50,1),
(100,1),
(150,1),
(200,0.9),
(400,0.8),
(1000,0.7),
(-1,1);

-- exchange_currency 
INSERT INTO exchange_currency(currency,exchange_rate,quantity) VALUES
('VND',1000,1),
('USD',1,23);

-- Follower
INSERT INTO followers(host_id,follower_id,created_at) VALUES
(5,6,'2021-08-01'),
(5,7,'2021-08-02'),
(5,8,'2021-08-03');

-- Donated
insert into history_donate(sender_id,receiver_id,token,created_at) values
(5,6,32,'2021-08-01'),
(5,7,54,'2021-08-02'),
(5,8,12,'2021-08-05'),
(5,6,100,'2021-08-06'),
(5,7,23,'2021-08-07'),
(5,8,200,'2021-08-10'),
(5,8,10,'2021-08-15'),

(6,5,12,'2021-08-01'),
(7,5,98,'2021-08-02'),
(8,5,43,'2021-08-05'),
(6,5,54,'2021-08-06'),
(7,5,6,'2021-08-07'),
(8,5,145,'2021-08-10'),
(7,5,69,'2021-08-15');

insert into history_purchase(user_id,token_id,token, amount,created_at) values
(5,2,100,4,'2021-08-01'),
(5,2,200,7,'2021-08-02'),
(5,2,150,6,'2021-08-05'),
(5,2,50,2,'2021-08-06'),
(5,2,50,2,'2021-08-07'),
(5,2,400,14,'2021-08-10'),
(5,2,50,2,'2021-08-15');

insert into rooms(streamer_id,title,likes,viewers,created_at,status) values
(5,'title',23,50,'2021-08-01',0),
(5,'title',10,10,'2021-08-02',0),
(5,'title',54,100,'2021-08-05',0),
(5,'title',10,24,'2021-08-06',0),
(5,'title',0,1,'2021-08-07',0),
(5,'title',3,8,'2021-08-10',0),
(5,'title',40,55,'2021-08-15',0);



