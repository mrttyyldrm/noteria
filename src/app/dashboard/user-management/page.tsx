"use client";

import UserManagementSkeleton from "./loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/context/LanguageContext";
import { useNotification } from "@/context/NotificationContext";
import useAPI from "@/hooks/useAPI";
import { useFormik } from "formik";
import {
  EllipsisVertical,
  RefreshCw,
  SearchIcon,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import * as yup from "yup";

interface IUser {
  userID: number;
  fullName: string;
  email: string;
  userType: {
    key: number;
    value: string;
  };
  userActive: boolean;
  mfaActive: boolean;
}

function UserManagementLoading() {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index}>
      <TableCell colSpan={7} className="p-1 bg-white">
        <Skeleton className="h-11" />
      </TableCell>
    </TableRow>
  ));
}

function UserManagement() {
  const { GET } = useAPI();
  const { showNotification } = useNotification();
  const { t } = useLanguage();

  const [users, setUsers] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<{
    process: "reset" | "status" | "password" | "update" | "create" | null;
    userID: number | null;
  }>({ process: null, userID: null });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dialog, setDialog] = useState<{
    process: "update" | "create" | null;
    user: IUser | null;
  }>({ process: null, user: null });

  const getUsers = () => {
    if (isLoading) return;

    setIsLoading(true);
    GET(
      "GetAllUsers",
      {},
      (data) => {
        setUsers(data);
        setIsLoading(false);
      },
      () => setIsLoading(false),
    );
  };

  const toggleAccountStatus = (userID: number, status: boolean) => {
    if (loading.process !== null) return;

    setLoading({ process: "status", userID });

    const userStatusData = {
      userID: userID,
      userStatus: status,
    };
    GET(
      "ToggleUserStatus",
      userStatusData,
      () => {
        setUsers((prev) =>
          prev.map((user) =>
            user.userID === userID ? { ...user, userActive: status } : user,
          ),
        );

        status
          ? showNotification(t("34A25EFD6"), "success")
          : showNotification(t("978A2883A"), "success");
        setLoading({ process: null, userID: null });
      },
      () => setLoading({ process: null, userID: null }),
    );
  };

  const resetPassword = (userID: number) => {
    if (loading.process !== null) return;

    setLoading({ process: "password", userID });
    GET(
      "ForgotPassword",
      { userID },
      () => {
        showNotification(t("FB0E7D535"), "success");
        showNotification(t("FC180BC03"), "default");
        setLoading({ process: null, userID: null });
      },
      () => setLoading({ process: null, userID: null }),
    );
  };

  const resetAccountMFA = (userID: number) => {
    if (loading.process !== null) return;

    setLoading({ process: "reset", userID });
    GET(
      "ResetUserMFA",
      { userID },
      () => {
        setUsers((prev) =>
          prev.map((user) =>
            user.userID === userID ? { ...user, mfaActive: false } : user,
          ),
        );
        showNotification(t("9DE8D2DB8"), "success");
        setLoading({ process: null, userID: null });
      },
      () => setLoading({ process: null, userID: null }),
    );
  };

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!users || (users.length === 0 && searchTerm === "")) {
    return <UserManagementSkeleton />;
  }

  return (
    <section className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <InputGroup className="sm:max-w-3xs">
          <InputGroupInput
            placeholder={t("877A8DC4F")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <Button onClick={() => setDialog({ process: "create", user: null })}>
          {t("40460F8F2")}
        </Button>
      </div>
      <Card className="overflow-x-auto">
        <Table className="p-1">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-3">#</TableHead>
              <TableHead>{t("B90C49F20")}</TableHead>
              <TableHead>{t("F69047778")}</TableHead>
              <TableHead>{t("722C02C19")}</TableHead>
              <TableHead>{t("49A56F386")}</TableHead>
              <TableHead>{t("F752E841C")}</TableHead>
              <TableHead className="min-w-20 flex justify-end items-center">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => getUsers()}
                >
                  <RefreshCw />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-muted-foreground">
            {isLoading ? (
              <UserManagementLoading />
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <TableRow key={index}>
                  <TableCell className="pl-3">{user.userID}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.userType.value}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.userActive ? "default" : "destructive"}
                    >
                      {user.userActive ? t("572300D84") : t("A6A0BC8C4")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.mfaActive ? "default" : "destructive"}>
                      {user.mfaActive ? t("572300D84") : t("A6A0BC8C4")}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          disabled={
                            loading.process === null &&
                            loading.userID === user.userID
                          }
                        >
                          <EllipsisVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40" align="end">
                        <DropdownMenuLabel>{t("EA1F69315")}</DropdownMenuLabel>
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            textValue="update"
                            onSelect={() =>
                              setDialog({ process: "update", user })
                            }
                          >
                            {t("3AA80D99C")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            textValue="status"
                            onSelect={() =>
                              toggleAccountStatus(user.userID, !user.userActive)
                            }
                          >
                            {user.userActive ? t("BB143469E") : t("504BC6599")}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>{t("E4C47695A")}</DropdownMenuLabel>
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            textValue="password"
                            onSelect={() => resetPassword(user.userID)}
                          >
                            {t("6E41E68BE")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            textValue="reset"
                            disabled={user.mfaActive === false}
                            onSelect={() => resetAccountMFA(user.userID)}
                          >
                            {t("8A05C491A")}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="bg-white">
                  <Empty className="p-2">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <UserRound />
                      </EmptyMedia>
                      <EmptyTitle>{t("786FCFBC7")}</EmptyTitle>
                      <EmptyDescription>{t("16920FC7F")}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <CreateOrUpdateUserDialog
        open={dialog.process !== null}
        user={dialog.user}
        onClose={() => setDialog({ process: null, user: null })}
        onSubmit={() => {
          getUsers();
        }}
      />
    </section>
  );
}

interface CreateOrUpdateUserDialogProps {
  open: boolean;
  user: IUser | null;
  onSubmit: () => void;
  onClose: () => void;
}

function CreateOrUpdateUserDialog({
  open,
  user,
  onSubmit,
  onClose,
}: CreateOrUpdateUserDialogProps) {
  const { GET, POST } = useAPI();
  const { showNotification } = useNotification();
  const { t, isLanguageLoading } = useLanguage();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userTypes, setUserTypes] = useState<Record<number, string> | null>(
    null,
  );

  const initialValues = user
    ? {
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
      }
    : {
        fullName: "",
        email: "",
        userType: { key: -1, value: "" },
      };

  const getUserTypes = () => {
    if (userTypes) return;

    GET("GetUserTypes", {}, (data: Record<number, string>) => {
      setUserTypes(data);
    });
  };

  const updateUser = (updateUser: Partial<IUser>) => {
    if (isLoading) return;

    POST(
      "UpdateUser",
      updateUser,
      () => {
        setIsLoading(false);
        showNotification(t("D30E4A874"), "success");
        onSubmit();
        onClose();
      },
      () => onClose(),
    );
  };

  const createUser = (createUser: Partial<IUser>) => {
    if (isLoading) return;

    POST(
      "AddUser",
      createUser,
      () => {
        setIsLoading(false);
        showNotification(t("B42AE5AEC"), "success");
        onSubmit();
        onClose();
      },
      () => onClose(),
    );
  };

  const validationSchema = yup.object({
    fullName: yup.string().required(t("2C936F5BA")),
    email: yup.string().email(t("9F2BE0310")).required(t("2C936F5BA")),
    userType: yup.object({
      key: yup.number().required(t("2C936F5BA")),
      value: yup.string().required(t("2C936F5BA")),
    }),
  });

  const formik = useFormik({
    initialValues: { ...initialValues, userID: user?.userID },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (user) {
        updateUser(values);
      } else {
        createUser(values);
      }
    },
  });

  useEffect(() => {
    if (isLanguageLoading) return;

    formik.validateForm();
  }, [isLanguageLoading]);

  useEffect(() => {
    getUserTypes();
  }, []);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-md">
        <DialogHeader>
          <DialogTitle>{user ? t("F6ED5B7C6") : t("EA1CB78DD")}</DialogTitle>
          <DialogDescription>
            {user ? t("BF0939C1D") : t("362A7AF51")}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">{t("B90C49F20")}</FieldLabel>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required={true}
                disabled={isLoading}
                value={formik.values.fullName}
                onChange={formik.handleChange}
                placeholder={t("B90C49F20")}
              />
              {formik.touched.fullName && formik.errors.fullName && (
                <FieldError>{formik.errors.fullName}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="title">{t("F69047778")}</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                required={true}
                disabled={isLoading}
                value={formik.values.email}
                onChange={formik.handleChange}
                placeholder={t("F69047778")}
              />
              {formik.touched.email && formik.errors.email && (
                <FieldError>{formik.errors.email}</FieldError>
              )}
            </Field>
            {userTypes !== null ? (
              <Field>
                <FieldLabel htmlFor="title">{t("722C02C19")}</FieldLabel>
                <ButtonGroup className="w-full grid grid-cols-3">
                  {Object.entries(userTypes).map(([key, value]) => (
                    <Button
                      type="button"
                      key={key}
                      disabled={isLoading}
                      variant={
                        formik.values.userType?.key === Number(key)
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        formik.setFieldValue("userType", {
                          key: Number(key),
                          value: value,
                        })
                      }
                    >
                      {value}
                    </Button>
                  ))}
                </ButtonGroup>
                {formik.touched.userType && formik.errors.userType && (
                  <FieldError>{formik.errors.userType.key}</FieldError>
                )}
              </Field>
            ) : (
              <Skeleton className="w-full h-9" />
            )}
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild disabled={isLoading}>
              <Button variant="outline">{t("1AF8F06BC")}</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : user ? t("3AA80D99C") : t("F03073054")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserManagement;
