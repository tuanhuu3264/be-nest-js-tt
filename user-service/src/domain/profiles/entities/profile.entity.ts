export class Profile {
  constructor(
    public readonly id: string,
    public readonly userId: number,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly bio: string | null,
    public readonly avatar: string | null,
    public readonly phone: string | null,
    public readonly email: string | null,
    public readonly dateOfBirth: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

