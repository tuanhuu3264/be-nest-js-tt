-- =====================================================
-- Material Service Database Schema
-- PostgreSQL Script
-- =====================================================

-- Create database (run separately if needed)
-- CREATE DATABASE mydb;

-- Connect to database
-- \c mydb;

-- =====================================================
-- ENUMS
-- =====================================================

-- Media Status Enum
CREATE TYPE media_status AS ENUM ('1', '2', '3');
-- 1 = ACTIVE, 2 = INACTIVE, 3 = SUSPENDED

-- Media Type Enum
CREATE TYPE media_type AS ENUM ('1', '2', '3', '4');
-- 1 = IMAGE, 2 = VIDEO, 3 = AUDIO, 4 = DOCUMENT

-- File Processing Status Enum
CREATE TYPE file_processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Quality Level Enum
CREATE TYPE quality_level AS ENUM ('original', 'high', 'medium', 'low');

-- Media Interaction Status Enum
CREATE TYPE media_interaction_status AS ENUM ('1', '2', '3');
-- 1 = ACTIVE, 2 = INACTIVE, 3 = DELETED

-- Media Interaction Type Enum
CREATE TYPE media_interaction_type AS ENUM ('1', '2', '3', '4', '5', '6', '7');
-- 1 = LIKE, 2 = COMMENT, 3 = SHARE, 4 = SAVE, 5 = DOWNLOAD, 6 = VIEW, 7 = REPORT

-- Media File Status Enum
CREATE TYPE media_file_status AS ENUM ('1', '2', '3');
-- 1 = ACTIVE, 2 = INACTIVE, 3 = DELETED

-- Media Token Status Enum
CREATE TYPE media_token_status AS ENUM ('1', '2', '3');
-- 1 = ACTIVE, 2 = INACTIVE, 3 = DELETED

-- =====================================================
-- TABLE: media
-- Bảng chính lưu thông tin media (video, image, audio, document)
-- =====================================================
CREATE TABLE IF NOT EXISTS media (
    id              VARCHAR(255) PRIMARY KEY,           -- Snowflake ID
    user_id         BIGINT NOT NULL,                    -- ID người dùng upload
    file_name       VARCHAR(500) NOT NULL,              -- Tên file gốc
    media_type      SMALLINT NOT NULL DEFAULT 1,        -- 1=IMAGE, 2=VIDEO, 3=AUDIO, 4=DOCUMENT
    media_url       VARCHAR(1000) NOT NULL,             -- URL truy cập media
    media_size      BIGINT NOT NULL DEFAULT 0,          -- Kích thước file (bytes)
    media_last_expiration TIMESTAMP,                    -- Thời gian hết hạn URL
    media_is_public BOOLEAN NOT NULL DEFAULT false,     -- Public hay private
    tags            TEXT[] DEFAULT '{}',                -- Mảng tags
    status          SMALLINT NOT NULL DEFAULT 1,        -- 1=ACTIVE, 2=INACTIVE, 3=SUSPENDED
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for media
CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_media_media_type ON media(media_type);
CREATE INDEX idx_media_status ON media(status);
CREATE INDEX idx_media_created_at ON media(created_at DESC);
CREATE INDEX idx_media_tags ON media USING GIN(tags);

-- =====================================================
-- TABLE: media_processing
-- Bảng lưu trạng thái xử lý file upload
-- =====================================================
CREATE TABLE IF NOT EXISTS media_processing (
    id              VARCHAR(255) PRIMARY KEY,           -- Snowflake ID
    media_id        VARCHAR(255) NOT NULL,              -- FK to media
    upload_key      VARCHAR(500) NOT NULL,              -- MinIO upload key
    status          VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    original_file_url VARCHAR(500),                     -- URL file gốc
    error_message   TEXT,                               -- Thông báo lỗi nếu failed
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for media_processing
CREATE INDEX idx_media_processing_media_id ON media_processing(media_id);
CREATE INDEX idx_media_processing_upload_key ON media_processing(upload_key);
CREATE INDEX idx_media_processing_status ON media_processing(status);
CREATE INDEX idx_media_processing_created_at ON media_processing(created_at DESC);

-- =====================================================
-- TABLE: processed_files
-- Bảng lưu các file đã xử lý với các quality level khác nhau
-- =====================================================
CREATE TABLE IF NOT EXISTS processed_files (
    id                  VARCHAR(255) PRIMARY KEY,       -- Snowflake ID
    media_processing_id VARCHAR(255) NOT NULL,          -- FK to media_processing
    quality             VARCHAR(50) NOT NULL,           -- original, high, medium, low
    file_url            VARCHAR(500) NOT NULL,          -- URL file đã xử lý
    file_size           BIGINT NOT NULL DEFAULT 0,      -- Kích thước file (bytes)
    width               INT,                            -- Chiều rộng (image/video)
    height              INT,                            -- Chiều cao (image/video)
    duration            INT,                            -- Thời lượng giây (video/audio)
    bitrate             INT,                            -- Bitrate (video/audio)
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_processed_files_media_processing 
        FOREIGN KEY (media_processing_id) 
        REFERENCES media_processing(id) 
        ON DELETE CASCADE
);

-- Indexes for processed_files
CREATE INDEX idx_processed_files_media_processing_id ON processed_files(media_processing_id);
CREATE INDEX idx_processed_files_quality ON processed_files(quality);

-- =====================================================
-- TABLE: media_interaction
-- Bảng lưu tương tác người dùng với media
-- =====================================================
CREATE TABLE IF NOT EXISTS media_interaction (
    id                      VARCHAR(255) PRIMARY KEY,   -- Snowflake ID
    user_id                 BIGINT NOT NULL,            -- ID người dùng
    media_id                VARCHAR(255) NOT NULL,      -- FK to media
    media_interaction_type  SMALLINT NOT NULL,          -- 1=LIKE, 2=COMMENT, 3=SHARE, 4=SAVE, 5=DOWNLOAD, 6=VIEW, 7=REPORT
    status                  SMALLINT NOT NULL DEFAULT 1, -- 1=ACTIVE, 2=INACTIVE, 3=DELETED
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for media_interaction
CREATE INDEX idx_media_interaction_user_id ON media_interaction(user_id);
CREATE INDEX idx_media_interaction_media_id ON media_interaction(media_id);
CREATE INDEX idx_media_interaction_type ON media_interaction(media_interaction_type);
CREATE INDEX idx_media_interaction_status ON media_interaction(status);
CREATE INDEX idx_media_interaction_user_media ON media_interaction(user_id, media_id);

-- =====================================================
-- TABLE: media_files
-- Bảng lưu tham chiếu file trong storage
-- =====================================================
CREATE TABLE IF NOT EXISTS media_files (
    id          VARCHAR(255) PRIMARY KEY,               -- Snowflake ID
    media_id    VARCHAR(255) NOT NULL,                  -- FK to media
    media_key   VARCHAR(500) NOT NULL,                  -- Storage key (MinIO path)
    status      SMALLINT NOT NULL DEFAULT 1,            -- 1=ACTIVE, 2=INACTIVE, 3=DELETED
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for media_files
CREATE INDEX idx_media_files_media_id ON media_files(media_id);
CREATE INDEX idx_media_files_media_key ON media_files(media_key);
CREATE INDEX idx_media_files_status ON media_files(status);

-- =====================================================
-- TABLE: media_token
-- Bảng lưu token truy cập media (cho private media)
-- =====================================================
CREATE TABLE IF NOT EXISTS media_token (
    id          VARCHAR(255) PRIMARY KEY,               -- Snowflake ID
    media_id    VARCHAR(255) NOT NULL,                  -- FK to media
    status      SMALLINT NOT NULL DEFAULT 1,            -- 1=ACTIVE, 2=INACTIVE, 3=DELETED
    ip_address  VARCHAR(45) NOT NULL,                   -- IPv4 or IPv6
    expires_at  TIMESTAMP NOT NULL,                     -- Thời gian hết hạn token
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for media_token
CREATE INDEX idx_media_token_media_id ON media_token(media_id);
CREATE INDEX idx_media_token_status ON media_token(status);
CREATE INDEX idx_media_token_expires_at ON media_token(expires_at);
CREATE INDEX idx_media_token_ip_address ON media_token(ip_address);

-- =====================================================
-- TRIGGERS: Auto update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_processing_updated_at
    BEFORE UPDATE ON media_processing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_interaction_updated_at
    BEFORE UPDATE ON media_interaction
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_files_updated_at
    BEFORE UPDATE ON media_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_token_updated_at
    BEFORE UPDATE ON media_token
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE media IS 'Bảng chính lưu thông tin media (video, image, audio, document)';
COMMENT ON TABLE media_processing IS 'Bảng lưu trạng thái xử lý file upload với các quality level';
COMMENT ON TABLE processed_files IS 'Bảng lưu các file đã xử lý (original, high, medium, low quality)';
COMMENT ON TABLE media_interaction IS 'Bảng lưu tương tác người dùng (like, comment, share, save, download, view, report)';
COMMENT ON TABLE media_files IS 'Bảng lưu tham chiếu file trong MinIO storage';
COMMENT ON TABLE media_token IS 'Bảng lưu token truy cập cho private media';

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================
-- INSERT INTO media (id, user_id, file_name, media_type, media_url, media_size, media_is_public, status)
-- VALUES ('123456789', 1, 'test-video.mp4', 2, 'http://localhost:9000/material-service/test-video.mp4', 1048576, true, 1);

