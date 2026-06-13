import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import TrelloLogo from "@/components/molecules/trello-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import useAuth from "@/hooks/apis/use-auth";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { useLogin } = useAuth();
  const { mutateAsync: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "swaroopch1234@gmail.com",
      password: "password123",
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#0079bf_0%,#5067c5_100%)] px-4">
      <div className="w-full max-w-sm rounded-lg bg-trello-card-background p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-2">
          <TrelloLogo className="size-10 text-trello-blue" />
          <h1 className="text-2xl font-semibold text-trello-blue">
            Log in to Trello
          </h1>
          <p className="text-center text-sm text-stale">
            Use your seeded account to access boards
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => login(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="swaroopch1234@gmail.com"
              className="rounded-sm"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <InputGroup className="rounded-sm">
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="password123"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {errors.password ? (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="w-full bg-trello-blue hover:bg-trello-blue-dark rounded-sm hover:cursor-pointer"
            disabled={isPending}
          >
            {isPending ? "Logging in..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
