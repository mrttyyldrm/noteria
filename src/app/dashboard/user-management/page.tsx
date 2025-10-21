"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import useAPI from "@/hooks/useAPI";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Search, UserRound } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
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
  EmptyMedia,
  EmptyTitle,
  EmptyHeader,
  EmptyDescription,
} from "@/components/ui/empty";
import UserManagementSkeleton from "./loading";
import { useNotification } from "@/context/NotificationContext";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { get } from "http";

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

function UserManagement() {
  const { GET } = useAPI();
  const { showNotification } = useNotification();

  const [users, setUsers] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<{
    process: "reset" | "status" | "password" | "update" | "create" | null;
    userID: number | null;
  }>({ process: null, userID: null });
  const [dialog, setDialog] = useState<{
    process: "update" | "create" | null;
    user: IUser | null;
  }>({ process: null, user: null });

  const getUsers = () => {
    GET("GetAllUsers", {}, (data) => {
      setUsers(data);
    });
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
            user.userID === userID ? { ...user, userActive: status } : user
          )
        );
        showNotification(
          `User has been ${status ? "enabled" : "disabled"} successfully.`,
          "success"
        );
        setLoading({ process: null, userID: null });
      },
      () => setLoading({ process: null, userID: null })
    );
  };

  const resetPassword = (userID: number) => {
    if (loading.process !== null) return;

    setLoading({ process: "password", userID });
    GET(
      "ResetPass",
      { userID },
      () => {
        showNotification(
          "The user's password has been successfully reset. A password reset link has been sent to the user's registered email address. Please check the email.",
          "success"
        );
        setLoading({ process: null, userID: null });
      },
      () => setLoading({ process: null, userID: null })
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
            user.userID === userID ? { ...user, mfaActive: false } : user
          )
        );
        showNotification(`User's MFA has been reset successfully.`, "success");
        setLoading({ process: null, userID: null });
      },
      () => setLoading({ process: null, userID: null })
    );
  };

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!users || (users.length === 0 && searchTerm === "")) {
    return <UserManagementSkeleton />;
  }

  return (
    <section className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setDialog({ process: "create", user: null })}>
          Create New User
        </Button>
      </div>
      <Card className="overflow-x-auto">
        <Table className="p-1">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-3">#</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>User Type</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>MFA Status</TableHead>
              <TableHead className="min-w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-muted-foreground">
            {filteredUsers.length > 0 ? (
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
                      {user.userActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.mfaActive ? "default" : "destructive"}>
                      {user.mfaActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={
                            loading.process === null &&
                            loading.userID === user.userID
                          }
                        >
                          <EllipsisVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40" align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            textValue="update"
                            onSelect={() =>
                              setDialog({ process: "update", user })
                            }
                          >
                            Update User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            textValue="status"
                            onSelect={() =>
                              toggleAccountStatus(user.userID, !user.userActive)
                            }
                          >
                            {user.userActive ? "Disable User" : "Enable User"}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Account</DropdownMenuLabel>
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            textValue="password"
                            onSelect={() => resetPassword(user.userID)}
                          >
                            Reset User Password
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            textValue="reset"
                            disabled={user.mfaActive === false}
                            onSelect={() => resetAccountMFA(user.userID)}
                          >
                            Reset User MFA
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="bg-white">
                  <Empty className="p-2">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <UserRound />
                      </EmptyMedia>
                      <EmptyTitle>No User Found</EmptyTitle>
                      <EmptyDescription>
                        Try creating a new user or check your search.
                      </EmptyDescription>
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

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userTypes, setUserTypes] = useState<Record<number, string> | null>(
    null
  );

  const emptyInitialValues: Partial<IUser> = {
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
        showNotification("User has been updated successfully.", "success");
        onSubmit();
        onClose();
      },
      () => onClose()
    );
  };

  const createUser = (createUser: Partial<IUser>) => {
    if (isLoading) return;

    POST(
      "AddUser",
      createUser,
      () => {
        setIsLoading(false);
        showNotification("User has been created successfully.", "success");
        onSubmit();
        onClose();
      },
      () => onClose()
    );
  };

  const validationSchema = yup.object({
    fullName: yup.string().required("Full Name is required!"),
    email: yup.string().email("Invalid email!").required("Email is required!"),
    userType: yup.object({
      key: yup.number().required("User Type is required!"),
      value: yup.string().required("User Type is required!"),
    }),
  });

  const formik = useFormik({
    initialValues: user
      ? {
          fullName: user.fullName,
          email: user.email,
          userType: user.userType,
        }
      : emptyInitialValues,
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
    getUserTypes();
  }, []);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-md">
        <DialogHeader>
          <DialogTitle>{user ? "Update User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Update the details for the selected user."
              : "Fill in the details to create a new user."}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Full Name</FieldLabel>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required={true}
                disabled={isLoading}
                value={formik.values.fullName}
                onChange={formik.handleChange}
                placeholder="Full Name"
              />
              {formik.touched.fullName && formik.errors.fullName && (
                <FieldError>{formik.errors.fullName}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="title">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                required={true}
                disabled={isLoading}
                value={formik.values.email}
                onChange={formik.handleChange}
                placeholder="Email"
              />
              {formik.touched.email && formik.errors.email && (
                <FieldError>{formik.errors.email}</FieldError>
              )}
            </Field>
            {userTypes !== null ? (
              <Field aria-required="true">
                <FieldLabel htmlFor="title">User Type</FieldLabel>
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
                  <FieldError>{formik.errors.userType}</FieldError>
                )}
              </Field>
            ) : (
              <Skeleton className="w-full h-9" />
            )}
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild disabled={isLoading}>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? user
                  ? "Updating..."
                  : "Creating..."
                : user
                ? "Update"
                : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserManagement;
