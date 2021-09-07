use web_streaming;

------------------------------- ROOM -----------------------------
-- Like Video 
DROP PROCEDURE IF EXISTS Room_Like;
DELIMITER $$
CREATE PROCEDURE `Room_Like`(IN $streamer_id INT,IN $like INT)
BEGIN
		UPDATE rooms SET likes = likes + 1
		WHERE streamer_id = $streamer_id ORDER BY id LIMIT 1;
    END$$
DELIMITER ;
-- Like Video

-- Online
DROP PROCEDURE IF EXISTS Room_RoomsOnline;
DELIMITER $$
CREATE PROCEDURE Room_RoomsOnline(IN $search NVARCHAR(100))
    BEGIN
		Select u.id,u.nickname, r.likes,r.title,r.description,r.tags,r.viewers,u.photo,r.thumbnail, r.status from rooms r
        Left JOIN users u ON u.id=r.streamer_id
        WHERE status<>0
        AND ((u.nickname LIKE CONCAT('%',$search,'%') OR $search IS NULL) OR ((r.tags LIKE CONCAT('%',$search,'%') OR $search IS NULL)))
        ORDER BY r.viewers,r.likes,r.created_at DESC;
    END $$
DELIMITER ;
-- CALL Room_RoomsOnline(null);

-- Room_SnapThumbnail
DROP PROCEDURE IF EXISTS Room_SnapThumbnail;
DELIMITER $$
CREATE PROCEDURE Room_SnapThumbnail(IN $user_id INT,IN $thumbnail varchar(100))
    BEGIN
		UPDATE rooms
        SET thumbnail=$thumbnail
        WHERE streamer_id=$user_id;
    END $$
DELIMITER ;
-- CALL Room_SnapThumbnail();

-- Room_SaveRecord
DROP PROCEDURE IF EXISTS `Room_SaveRecord`;
DELIMITER $$
CREATE PROCEDURE `Room_SaveRecord`(IN $user_id INT,IN $title varchar(100),IN $video_path varchar(100))
BEGIN
		INSERT INTO videos(streamer_id,title,video_path) VALUES
        ($user_id,$title,$video_path);
    END$$
DELIMITER ;
-- CALL Room_SaveRecord();

-- Room_SaveRecordThumbnail 
DROP PROCEDURE IF EXISTS Room_SaveRecordThumbnail;
DELIMITER $$
CREATE PROCEDURE Room_SaveRecordThumbnail(IN $user_id INT,IN $thumbnail varchar(100))
BEGIN
	UPDATE videos v
    SET thumbnail_path=$thumbnail
    WHERE v.streamer_id=$user_id
    ORDER BY v.created_at DESC LIMIT 1;
END$$
DELIMITER ;
--  CALL Room_SaveRecordThumbnail(1,'/20210715/Screen%20Shot%202021-07-15%20at%2011.47.15.png');

-- UPDATE VIDEO
DROP PROCEDURE IF EXISTS Update_Video;
DELIMITER $$
CREATE PROCEDURE Update_Video(IN $video_id INT, IN $title nvarchar(100))
    BEGIN
		UPDATE videos SET title=$title WHERE id = $video_id AND status<>0;
    END $$
DELIMITER ;
-- CALL Update_Video(5,'horror game123;);

-- DELETE VIDEO
DROP PROCEDURE IF EXISTS Deleted_Video;
DELIMITER $$
CREATE PROCEDURE Deleted_Video(IN $video_id INT)
    BEGIN
		DELETE FROM videos WHERE id=$video_id;
    END $$
DELIMITER ;
-- Deleted_Video(1);

-- Get All Videos
DROP PROCEDURE IF EXISTS Room_GetAllVideos;
DELIMITER $$
CREATE PROCEDURE Room_GetAllVideos(IN $user_id INT,IN $search NVARCHAR(100))
    BEGIN
         SELECT v.id,v.streamer_id,v.title,u.nickname,v.thumbnail_path as thumbnail,u.photo,v.created_at
		 FROM videos v
         LEFT JOIN users u ON u.id=v.streamer_id
		 WHERE v.status<>0
         AND (u.id=$user_id OR $user_id = -1)
         AND ((u.nickname LIKE CONCAT('%',$search,'%') OR $search IS NULL) OR (v.title LIKE CONCAT('%',$search,'%') OR $search IS NULL))
         ORDER BY v.created_at DESC;
    END $$
DELIMITER ;
-- CALL Room_GetAllVideos(1,null);

-- Room_GetVideoPath
DROP PROCEDURE IF EXISTS Room_GetVideoPath;
DELIMITER $$
CREATE PROCEDURE Room_GetVideoPath(IN $id_user INT,IN $id_video INT)
    BEGIN
		SELECT video_path FROM videos where id=$id_video and streamer_id=$id_user and status<>0;
    END $$
DELIMITER ;
-- CALL Room_GetVideoPath(1,1);

-- Room_Info
DROP PROCEDURE IF EXISTS Room_Info;
DELIMITER $$
CREATE PROCEDURE Room_Info(IN $nickname varchar(50),IN $idUser INT)
    BEGIN
		DECLARE $host_id int;
        SET $host_id=(SELECT id From Users where nickname=$nickname);
        
		SELECT u.id as streamer_id,r.id as room_id,r.status as room_status,u.nickname,u.fullname,u.photo,r.title,r.description,r.likes,r.viewers,IF(f.host_id IS NULL, 0, 1) as isSubscribed ,r.tags,r.thumbnail,r.created_at 
        FROM users u
        LEFT JOIN rooms r ON r.streamer_id=u.id
        LEFT JOIN followers f ON f.host_id=$host_id and f.follower_id=$idUser
        WHERE nickname=$nickname;
    END $$
DELIMITER ;
-- CALL Room_Info('nltbao',3);

-- Tags
DROP PROCEDURE IF EXISTS Room_Tags;
DELIMITER $$
CREATE PROCEDURE Room_Tags()
    BEGIN
		Select id as value,name as label from tags;
    END $$
DELIMITER ;
-- CALL Room_Tags();

-- On Start
DROP PROCEDURE IF EXISTS Room_OnStart;
DELIMITER $$
CREATE PROCEDURE Room_OnStart(IN $streamer_id INT,IN $title nvarchar(100),IN $description nvarchar(100),IN $tags nvarchar(4000),IN $thumbnail varchar(100),IN $trace nvarchar(4000))
    BEGIN
		DECLARE $lastStatus INT; 
        SET $lastStatus=(Select status FROM rooms WHERE streamer_id=$streamer_id ORDER BY created_at DESC LIMIT 1);
		
        INSERT INTO logs(user_id,type_name,trace) VALUES($streamer_id,'Room_OnStart',$trace);
        
        IF ($lastStatus=0 OR $lastStatus IS NULL) THEN
         INSERT INTO rooms(streamer_id,title,description,tags,thumbnail) VALUES
         ($streamer_id,$title,$description,$tags,$thumbnail);
        END IF;
        
        SELECT u.nickname as streamer,r.* FROM rooms r 
        LEFT JOIN users u ON u.id=r.streamer_id
		WHERE r.streamer_id=$streamer_id AND r.status=1
		ORDER BY r.created_at DESC LIMIT 1;
    END$$
DELIMITER ;
-- CALL Room_OnStart(4,'asd asdas dasda sd asda', 'alo alo alo alo','','','');
-- CALL Room_OnStart(1,'asaf','123123','[{"value":2,"label":"Moba"},{"value":4,"label":"Horror"},{"value":5,"label":"FPS"}]','','{"user_id":1,"title":"asaf","description":"123123","tags":"[{\"value\":2,\"label\":\"Moba\"},{\"value\":4,\"label\":\"Horror\"},{\"value\":5,\"label\":\"FPS\"}]","thumbnail":""}');

-- On End
DROP PROCEDURE IF EXISTS Room_OnEnd;
DELIMITER $$
CREATE PROCEDURE Room_OnEnd(IN $room_id INT,IN $streamer_id INT,IN $status INT)
    BEGIN
		DECLARE EXIT HANDLER FOR SQLEXCEPTION 
		BEGIN
		  SET @flag = 0; 
		  ROLLBACK;
		END;
        START TRANSACTION;
			UPDATE rooms r
        SET r.status=$status
        WHERE r.id=$room_id AND r.streamer_id=$streamer_id; 
		COMMIT;
		SET @flag = 1;
        SELECT @flag as result;
    END $$
DELIMITER ;
-- CALL Room_OnEnd(2,1,1);

-- ----------------------------- USER -----------------------------
-- Subscribe
DROP PROCEDURE IF EXISTS User_Subscribe;
DELIMITER $$
CREATE PROCEDURE User_Subscribe(IN $isSubscribed INT,IN $host_id INT,IN $follower_id INT)
    BEGIN
		IF($isSubscribed=0) THEN
			IF NOT EXISTS(SELECT 1 FROM followers where host_id=$host_id AND follower_id=$follower_id) THEN
				INSERT INTO followers(host_id,follower_id) VALUES
				($host_id,$follower_id);
				SET $isSubscribed=1;
            END IF;
		ELSE 
			DELETE FROM followers WHERE host_id=$host_id and follower_id=$follower_id;	
            SET $isSubscribed=0;
		END IF;
        SELECT $isSubscribed as isSubscribed;
	END $$
DELIMITER ;									
-- CALL User_Subscribe(0,1,3);

-- User_Register
DROP PROCEDURE IF EXISTS User_Register;
DELIMITER $$
CREATE PROCEDURE User_Register(IN $username varchar(20), IN $password varchar(255),IN $nickname varchar(20),IN $email varchar(50))
    BEGIN
		IF EXISTS (SELECT 1 from users a WHERE a.username=$username) THEN
			SELECT 'Username has already been taken' as msg,-1 as status;
		ELSEIF EXISTS (SELECT 1 from users a WHERE a.nickname=$nickname) THEN
			SELECT 'Nickname has already been taken' as msg,-1 as status;
		ELSEIF EXISTS (SELECT 1 from users a WHERE a.email=$email) THEN
			SELECT 'Email has already been taken' as msg,-1 as status;
        ELSE
            INSERT INTO users(username,password,nickname,email) VALUES
            ($username,$password,$nickname,$email);
		
            SELECT *,'Register successfully' as msg,1 as status 
            FROM users u where u.username=$username;
        END IF;
	END $$
DELIMITER ;									
-- CALL User_Register('asdasd','2323','434','asd@gmail.com');

-- User_Login
DROP PROCEDURE IF EXISTS User_Login;
DELIMITER $$
CREATE PROCEDURE User_Login(IN $username varchar(20))
    BEGIN
		SELECT u.id,u.nickname,u.password,u.role_user,u.fullname,u.token,u.email,u.photo
        FROM users u
        WHERE u.username=$username;
	END $$
DELIMITER ;									
-- CALL User_Login('bao');

-- User_Update_Password
DROP PROCEDURE IF EXISTS User_Update_Password;
DELIMITER $$
CREATE PROCEDURE User_Update_Password(IN $email varchar(100),IN $password varchar(255))
    BEGIN
		UPDATE users u SET password=$password WHERE email=$email;
	END $$
DELIMITER ;									
-- CALL User_Update_Password('nguyenletienbao99@gmail.com','$2b$10$kWeLjltb3iNry0Y19IG6Eub9ntRPmspWkWxQTg38Pj32Ze.f2BB9u')

-- User_GetInfo
DROP PROCEDURE IF EXISTS User_GetInfo;
DELIMITER $$
CREATE PROCEDURE User_GetInfo(IN $user_id INT)
    BEGIN
		SELECT u.id,u.username,u.nickname,u.role_user,u.fullname,u.token,u.email,u.photo
        FROM users u
        WHERE u.id=$user_id;
	END $$
DELIMITER ;									
-- CALL User_GetInfo(1);

-- User_GetProfileInfo
DROP PROCEDURE IF EXISTS User_GetProfileInfo;
DELIMITER $$
CREATE PROCEDURE User_GetProfileInfo(IN $nickname VARCHAR(20),IN $host_id INT)
    BEGIN
		DECLARE $followers INT;
        DECLARE $videos INT;
        
		SET $followers=(SELECT COUNT(*) FROM followers f LEFT JOIN users u ON u.id=f.host_id WHERE u.nickname=$nickname);
		SET $videos=(SELECT COUNT(*) FROM videos v LEFT JOIN users u ON u.id=v.streamer_id WHERE u.nickname=$nickname);

		SELECT u.id,u.username,u.nickname,u.role_user,u.fullname,u.bio,u.token,u.email,$followers as followers,$videos as videos,u.photo,
        (SELECT COUNT(*) FROM followers f WHERE f.host_id=$host_id AND f.follower_id=u.id) as isSubscribed 
        FROM users u
        WHERE u.nickname=$nickname;
	END $$
DELIMITER ;									
-- CALL User_GetProfileInfo('khoi',1);

-- User_UpdateProfileInfo
DROP PROCEDURE IF EXISTS User_UpdateProfileInfo;
DELIMITER $$
CREATE PROCEDURE User_UpdateProfileInfo(IN $user_id INT,IN $fullname NVARCHAR(20),IN $nickname varchar(20),IN $bio NVARCHAR(100))
    BEGIN
		DECLARE $result INT;
        SET $result = 0;
		IF NOT EXISTS(SELECT 1 FROM users u WHERE u.nickname=$nickname AND u.id<>$user_id) THEN
			UPDATE users u
			SET u.fullname=$fullname,u.nickname=$nickname,u.bio=$bio
			WHERE u.id=$user_id;
            SET $result = 1;
        END IF;
		SELECT $result as result;
	END $$
DELIMITER ;									
-- CALL User_UpdateProfileInfo(1,'asd','nltbao','hello');

-- ----------------------------- PAYMENT -----------------------------
-- Purchase Token
DROP PROCEDURE IF EXISTS Payment_PurchaseToken;
DELIMITER $$
CREATE PROCEDURE Payment_PurchaseToken(IN $id_user INT,IN $currency varchar(10),IN $quantity float,IN $trace nvarchar(4000))
    BEGIN
        DECLARE $exchange_id INT;
        DECLARE $actual_amount float;
        DECLARE $exchange_rate INT;
        DECLARE $promotion FLOAT;
        
        SET $exchange_rate=(
			SELECT ec.quantity as exchange_rate
			FROM exchange_currency ec 
			WHERE ec.is_active=1 AND ec.currency=$currency ORDER BY ec.created_at DESC LIMIT 1
		);
        SET $promotion = (
			SELECT op.promotion
            FROM options_purchase op
            WHERE op.quantity=$quantity
        );
        IF $promotion IS NULL THEN
			SET $promotion=1;
		END IF;
   
        CREATE TEMPORARY TABLE $current_exchange(id int,actual_amount float); 
		INSERT INTO $current_exchange
		SELECT t.id,
		ROUND(($quantity/$exchange_rate) * $promotion,2) as actual_amount
		FROM exchange_currency t 
 		WHERE t.is_active=1 and t.currency=$currency
 		ORDER BY t.created_at DESC LIMIT 1;
	
		SET $exchange_id=(SELECT ce.id FROM $current_exchange ce);
		SET $actual_amount=(SELECT ce.actual_amount FROM $current_exchange ce);
        
 		INSERT INTO logs(user_id,type_name,trace) VALUES
        ($id_user,'Payment_PurchaseToken',$trace);
 		
 		INSERT INTO history_purchase(user_id,token_id,token,amount) VALUES
 		($id_user,$exchange_id,$quantity,$actual_amount);
 		
		UPDATE users u
 		SET u.token=u.token + $quantity
		WHERE u.id=$id_user;
         
		SELECT u.id,u.nickname,u.token as actual_token,$quantity as purchased_token,$actual_amount as actual_amount
		FROM users u WHERE u.id=$id_user;
        
        DROP TABLE $current_exchange;
	END $$
DELIMITER ;									
-- CALL Payment_PurchaseToken(1,'USD',1000,'{}');

-- Payment_Donate
DROP PROCEDURE IF EXISTS Payment_Donate;
DELIMITER $$
CREATE PROCEDURE Payment_Donate(IN $sender_id INT, IN $receiver_id INT, IN $quantity INT)
    BEGIN   
		DECLARE EXIT HANDLER FOR SQLEXCEPTION 
		BEGIN
		  SET @flag = 0; 
		  ROLLBACK;
		END;
		START TRANSACTION;
			-- 1: succeed,2: not enough,3: itself
			IF ($sender_id = $receiver_id) THEN
				SET @flag = 3;
			ELSEIF (SELECT token FROM users u WHERE u.id=$sender_id) >= $quantity THEN
				UPDATE users 
				SET token = (token + $quantity)
				where id = $receiver_id;
				UPDATE users 
				SET token = (token-$quantity)
				where id = $sender_id;
				INSERT INTO history_donate (sender_id, receiver_id, token)
				VALUES ($sender_id, $receiver_id, $quantity);   
                SET @flag = 1;
            ELSE 
				SET @flag = 2;
            END IF;
		COMMIT;
        SELECT @flag as result;
    END $$
DELIMITER ;
-- CALL Payment_Donate(3,2,10);

-- Payment_Options
DROP PROCEDURE IF EXISTS Payment_Options;
DELIMITER $$
CREATE PROCEDURE Payment_Options()
    BEGIN
		DECLARE $exchange_rate INT;
        SET $exchange_rate=(
			SELECT ec.quantity as exchange_rate 
            FROM exchange_currency ec 
            WHERE ec.is_active=1 AND ec.currency='USD' ORDER BY ec.created_at DESC LIMIT 1
        );
		SELECT CONCAT(op.quantity,' tokens for ',ROUND((op.quantity/$exchange_rate) * op.promotion,2),' USD',IF(op.promotion<>1,CONCAT(' Promotion(',ROUND((1-op.promotion) * 100),'%)') ,'')) as name, op.quantity as token,
        ROUND((op.quantity/$exchange_rate) * op.promotion,2) as amount
        FROM options_purchase op
        WHERE op.quantity<>-1;
	END $$
DELIMITER ;									
-- CALL Payment_Options();
-- --------------------------------------analyze ------------------------------

-- DATA_STATISTICS
drop procedure if exists DATA_STATISTICS;
delimiter $$
create procedure  DATA_STATISTICS(in $user_id int)
begin
    DECLARE $SENDED_TOKEN INT;
    DECLARE $RECEIVED_TOKEN INT;
    DECLARE $SUM_TOKEN INT;
    
    SET $SENDED_TOKEN =(
		SELECT SUM(token) FROM history_donate WHERE sender_id=$user_id
    );
    SET $RECEIVED_TOKEN =(
		SELECT SUM(token) FROM history_donate WHERE receiver_id=$user_id
    );
    SET $SUM_TOKEN = IFNULL($SENDED_TOKEN, 0) + IFNULL($RECEIVED_TOKEN, 0);
    
    -- Transaction Donate
    SELECT (IFNULL($SENDED_TOKEN, 0)/$SUM_TOKEN)*100 as sent_token,(IFNULL($RECEIVED_TOKEN, 0)/$SUM_TOKEN)*100 as received_token,$SUM_TOKEN as total_sum;
    
    -- Transaction Banking
    SELECT FLOOR(SUM(amount)) as deposit, FLOOR(SUM(amount)) as total_Sum FROM history_purchase WHERE user_id=$user_id;
   
	-- LIKES
     SELECT SUM(r.likes) as y, DATE_FORMAT(r.created_at, '%Y-%m-%d') as name
	 	FROM rooms r 
		WHERE r.streamer_id=$user_id
	 	GROUP BY DATE_FORMAT(r.created_at, '%Y-%m-%d');
	-- SELECT FLOOR(RAND()*30) as y, id as name FROM (SELECT 0 as id UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 ) `table1`;
   
	-- VIEWERS
	 SELECT SUM(r.viewers) as y, DATE_FORMAT(r.created_at, '%Y-%m-%d') as name
	 	FROM rooms r 
	 	WHERE r.streamer_id=$user_id
	 	GROUP BY DATE_FORMAT(r.created_at, '%Y-%m-%d');
	-- SELECT FLOOR(RAND()*30) as y, id as name FROM (SELECT 0 as id UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 ) `table1`;
	
    -- SUBSCRIPTIONS
	  SELECT COUNT(fl.host_id) as y, DATE_FORMAT(fl.created_at, '%Y-%m-%d') as name
	 	FROM followers fl
	 	WHERE fl.host_id=5
		GROUP BY DATE_FORMAT(fl.created_at, '%Y-%m-%d');
	-- SELECT FLOOR(RAND()*30) as y, id as name FROM (SELECT 0 as id UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 ) `table1`;
	
    -- RECEIVED TOKENS        
	 SELECT SUM(token) as y, DATE_FORMAT(hd.created_at, '%Y-%m-%d') as name
 	FROM history_donate hd
	WHERE hd.receiver_id=$user_id
	GROUP BY DATE_FORMAT(hd.created_at, '%Y-%m-%d');
	-- SELECT FLOOR(RAND()*30) as y, id as name FROM (SELECT 0 as id UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 ) `table1`;
	 
     -- BUY TOKENS        
	SELECT FLOOR(SUM(amount)) as y, DATE_FORMAT(hp.created_at, '%Y-%m-%d') as name
 	FROM history_purchase hp
 	WHERE hp.user_id=$user_id
 	GROUP BY DATE_FORMAT(hp.created_at, '%Y-%m-%d');
 -- SELECT FLOOR(RAND()*30) as y, id as name FROM (SELECT 0 as id UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 ) `table1`;
end$$
delimiter ;
-- CALL DATA_STATISTICS(5)
