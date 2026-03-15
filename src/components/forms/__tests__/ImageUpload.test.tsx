/**
 * ImageUpload 组件单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageUpload } from '../ImageUpload';
import { supabase } from '@/services/supabase/client';

// Mock Supabase 客户端
vi.mock('@/services/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
  },
}));

describe('ImageUpload', () => {
  const mockOnUploadSuccess = vi.fn();
  const mockOnUploadError = vi.fn();
  const mockOnDelete = vi.fn();
  const userId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该渲染占位符', () => {
    render(<ImageUpload pathPrefix={userId} onUploadSuccess={mockOnUploadSuccess} />);

    expect(screen.getByText('点击选择图片')).toBeInTheDocument();
    expect(screen.getByText(/支持 JPG、PNG、WebP 格式/)).toBeInTheDocument();
  });

  it('应该显示当前图片', () => {
    const currentImageUrl = 'https://example.com/image.jpg';

    render(
      <ImageUpload
        pathPrefix={userId}
        currentImageUrl={currentImageUrl}
        onUploadSuccess={mockOnUploadSuccess}
      />
    );

    const img = screen.getByAltText('预览') as HTMLImageElement;
    expect(img.src).toBe(currentImageUrl);
  });

  it('应该验证文件类型', async () => {
    render(<ImageUpload pathPrefix={userId} onUploadSuccess={mockOnUploadSuccess} />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/不支持的文件类型/)).toBeInTheDocument();
    });
  });

  it('应该验证文件大小', async () => {
    render(
      <ImageUpload
        pathPrefix={userId}
        maxSize={1024} // 1KB
        onUploadSuccess={mockOnUploadSuccess}
      />
    );

    // 创建一个超过 1KB 的文件
    const largeContent = new Array(2048).fill('a').join('');
    const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/文件大小超过/)).toBeInTheDocument();
    });
  });

  it('应该显示文件信息', async () => {
    render(<ImageUpload pathPrefix={userId} onUploadSuccess={mockOnUploadSuccess} />);

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
      expect(screen.getByText('上传')).toBeInTheDocument();
    });
  });

  it('应该调用上传成功回调', async () => {
    const mockUpload = vi.fn().mockResolvedValue({
      data: { path: 'test-path' },
      error: null,
    });

    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/uploaded.jpg' },
    });

    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    } as any);

    render(<ImageUpload pathPrefix={userId} onUploadSuccess={mockOnUploadSuccess} />);

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('上传')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('上传');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockOnUploadSuccess).toHaveBeenCalledWith(
        'https://example.com/uploaded.jpg',
        expect.stringContaining(userId)
      );
    });
  });

  it('应该调用上传失败回调', async () => {
    const mockUpload = vi.fn().mockRejectedValue(new Error('上传失败'));

    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
    } as any);

    render(
      <ImageUpload
        pathPrefix={userId}
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('上传')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('上传');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalled();
      expect(screen.getByText(/上传失败/)).toBeInTheDocument();
    });
  });

  it('应该调用删除回调', () => {
    const currentImageUrl = 'https://example.com/image.jpg';

    render(
      <ImageUpload
        pathPrefix={userId}
        currentImageUrl={currentImageUrl}
        onUploadSuccess={mockOnUploadSuccess}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText('删除');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('禁用状态下不应该允许操作', () => {
    render(
      <ImageUpload pathPrefix={userId} onUploadSuccess={mockOnUploadSuccess} disabled={true} />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('应该使用正确的存储桶', async () => {
    const mockUpload = vi.fn().mockResolvedValue({
      data: { path: 'test-path' },
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      upload: mockUpload,
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/uploaded.jpg' },
      }),
    });

    vi.mocked(supabase.storage.from).mockImplementation(mockFrom as any);

    render(
      <ImageUpload
        bucket="user-avatars"
        pathPrefix={userId}
        onUploadSuccess={mockOnUploadSuccess}
      />
    );

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('上传')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('上传');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('user-avatars');
    });
  });
});
