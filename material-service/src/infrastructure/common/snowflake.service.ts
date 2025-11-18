import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Snowflake ID Generator
 * Generates unique 64-bit integers based on Twitter's Snowflake algorithm
 * Format: 41 bits timestamp + 10 bits machine ID + 12 bits sequence
 */
@Injectable()
export class SnowflakeService implements OnModuleInit {
  private readonly EPOCH = 1609459200000n;
  private readonly MACHINE_ID_BITS = 10n;
  private readonly SEQUENCE_BITS = 12n;
  private readonly MAX_MACHINE_ID = (1n << this.MACHINE_ID_BITS) - 1n;
  private readonly MAX_SEQUENCE = (1n << this.SEQUENCE_BITS) - 1n;

  private readonly MACHINE_ID_SHIFT = this.SEQUENCE_BITS;
  private readonly TIMESTAMP_SHIFT = this.SEQUENCE_BITS + this.MACHINE_ID_BITS;

  private sequence = 0n;
  private lastTimestamp = 0n;
  private machineId: bigint;

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    // Temporary machineId, will be set in onModuleInit
    this.machineId = BigInt(process.pid % Number(this.MAX_MACHINE_ID));
  }

  onModuleInit() {
    // Read machineId from config (YAML) or env, fallback to process.pid
    const configMachineId = this.configService.get<number>('app.snowflake.machineId');
    const envMachineId = process.env.SNOWFLAKE_MACHINE_ID
      ? parseInt(process.env.SNOWFLAKE_MACHINE_ID, 10)
      : undefined;

    const machineId = configMachineId ?? envMachineId ?? (process.pid % Number(this.MAX_MACHINE_ID));
    this.machineId = BigInt(machineId) & this.MAX_MACHINE_ID;
  }

  /**
   * Generate a new Snowflake ID
   * @returns 64-bit integer as number (JavaScript safe integer range)
   */
  generate(): number {
    let timestamp = BigInt(Date.now()) - this.EPOCH;

    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards. Refusing to generate id');
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & this.MAX_SEQUENCE;
      if (this.sequence === 0n) {
        timestamp = this.waitNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    const id =
      (timestamp << this.TIMESTAMP_SHIFT) |
      (this.machineId << this.MACHINE_ID_SHIFT) |
      this.sequence;

    return Number(id);
  }

  private waitNextMillis(lastTimestamp: bigint): bigint {
    let timestamp = BigInt(Date.now()) - this.EPOCH;
    while (timestamp <= lastTimestamp) {
      timestamp = BigInt(Date.now()) - this.EPOCH;
    }
    return timestamp;
  }

  /**
   * Parse Snowflake ID to extract timestamp, machine ID, and sequence
   */
  parse(id: number): {
    timestamp: number;
    machineId: number;
    sequence: number;
    date: Date;
  } {
    const idBigInt = BigInt(id);
    const timestamp = Number((idBigInt >> this.TIMESTAMP_SHIFT) + this.EPOCH);
    const machineId = Number((idBigInt >> this.MACHINE_ID_SHIFT) & this.MAX_MACHINE_ID);
    const sequence = Number(idBigInt & this.MAX_SEQUENCE);

    return {
      timestamp,
      machineId,
      sequence,
      date: new Date(timestamp),
    };
  }
}

