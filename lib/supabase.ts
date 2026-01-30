
import { createClient } from '@supabase/supabase-js';

// 실제 서비스 시에는 환경 변수를 사용하세요.
const supabaseUrl = 'https://msoiyslijsdkdgxfgnms.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zb2l5c2xpanNka2RneGZnbm1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNDU5MDUsImV4cCI6MjA4MjcyMTkwNX0.B6zhQyp_4FOdcSZgTdrL7xHWOJFk6K3ZjhoytFKIkiw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase Storage에 파일을 업로드하고 공용 URL을 반환합니다.
 * 'report-assets' 버킷이 생성되어 있고 public 권한이 있어야 합니다.
 */
export const uploadImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  // 업로드 시도
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('report-assets')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Supabase Storage Upload Error Detail:', uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // 공용 URL 가져오기
  const { data } = supabase.storage
    .from('report-assets')
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error('Failed to get public URL');
  }

  return data.publicUrl;
};
