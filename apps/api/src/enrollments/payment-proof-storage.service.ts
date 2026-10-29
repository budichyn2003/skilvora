import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type PaymentProofUpload = {
  buffer: Buffer;
  mimetype: string;
  size: number;
};

export type StoredPaymentProof = {
  buffer: Buffer;
  contentType: string;
};

const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

export function validatePaymentProof(file: PaymentProofUpload | undefined) {
  if (!file || !Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
    throw new BadRequestException(
      'Pilih file bukti pembayaran terlebih dahulu',
    );
  }
  if (
    file.buffer.length > MAX_PROOF_SIZE_BYTES ||
    file.size > MAX_PROOF_SIZE_BYTES
  ) {
    throw new BadRequestException('Ukuran bukti pembayaran maksimal 5 MB');
  }

  if (
    file.mimetype === 'image/jpeg' &&
    file.buffer[0] === 0xff &&
    file.buffer[1] === 0xd8 &&
    file.buffer[2] === 0xff
  ) {
    return { contentType: 'image/jpeg', extension: 'jpg' };
  }
  if (
    file.mimetype === 'image/png' &&
    file.buffer.length >= PNG_SIGNATURE.length &&
    file.buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)
  ) {
    return { contentType: 'image/png', extension: 'png' };
  }

  throw new BadRequestException(
    'Bukti harus berupa gambar PNG atau JPEG yang valid',
  );
}

@Injectable()
export class PaymentProofStorageService {
  private client?: S3Client;

  constructor(private readonly config: ConfigService) {}

  async upload(key: string, buffer: Buffer, contentType: string) {
    const { client, bucket } = this.getClientAndBucket();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'private, no-store',
      }),
    );
  }

  async download(key: string): Promise<StoredPaymentProof> {
    const { client, bucket } = this.getClientAndBucket();
    const response = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    if (!response.Body) {
      throw new NotFoundException(
        'Bukti pembayaran tidak ditemukan di storage',
      );
    }

    return {
      buffer: Buffer.from(await response.Body.transformToByteArray()),
      contentType: response.ContentType || 'application/octet-stream',
    };
  }

  async delete(key: string) {
    const { client, bucket } = this.getClientAndBucket();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }

  private getClientAndBucket() {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID')?.trim();
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID')?.trim();
    const secretAccessKey = this.config
      .get<string>('R2_SECRET_ACCESS_KEY')
      ?.trim();
    const bucket = this.config.get<string>('R2_BUCKET_NAME')?.trim();

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
      throw new ServiceUnavailableException(
        'Penyimpanan bukti pembayaran belum dikonfigurasi',
      );
    }

    this.client ??= new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    });

    return { client: this.client, bucket };
  }
}
