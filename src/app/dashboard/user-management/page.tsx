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
import { Pencil, Trash2, Search, UserRound } from "lucide-react";
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyHeader,
  EmptyDescription,
} from "@/components/ui/empty";
import UserManagementSkeleton from "./loading";

interface IUser {
  userID: number;
  email: string;
  authorization: "Clerk" | "Notary";
  mfaCode: string | null;
}

function UserManagement() {
  const { GET } = useAPI();

  const [users, setUsers] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    GET("GetAllUsers", {}, (data) => {
      setUsers(data);
    });
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.authorization.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Button>Create New User</Button>
      </div>
      <Card className="overflow-x-auto">
        <Table className="p-1">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-3">#</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Authorization</TableHead>
              <TableHead>MFA Code</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-muted-foreground">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <TableRow key={index}>
                  <TableCell className="pl-3">{user.userID}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.authorization === "Clerk" ? "outline" : "default"
                      }
                    >
                      {user.authorization}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.mfaCode ?? "-"}</TableCell>
                  <TableCell className="flex justify-end items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Pencil />
                    </Button>
                    <Button variant="destructive" size="icon">
                      <Trash2 />
                    </Button>
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
    </section>
  );
}

export default UserManagement;
