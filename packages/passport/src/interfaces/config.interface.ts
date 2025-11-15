import { JwtModuleOptions } from '@nestjs/jwt';

export interface PassportConfigRule {
  name: string;
  condition: (context: any) => boolean;
  config: PassportConnectionConfig;
}

export interface PassportConnectionConfig {
  jwt?: JwtModuleOptions & {
    secret: string;
    signOptions?: {
      expiresIn?: string | number;
      issuer?: string;
      audience?: string;
    };
  };
  local?: {
    usernameField?: string;
    passwordField?: string;
    session?: boolean;
  };
  defaultStrategy?: 'jwt' | 'local';
  session?: boolean;
  failureRedirect?: string;
  successRedirect?: string;
}

