"use client";

import {
  Stack,
  Search,
  Text,
  Icon,
  Table,
  Td,
  Tr,
  Line,
  Title,
} from "@/components";
import React, { useState } from "react";

const columns = [
  "Full Name",
  "ID Number",
  "Property ID",
  "Ban Reason",
  "Validity Date",
  "Action",
];

type BlacklistEntry = {
  fullName: string;
  idNumber: string;
  propertyId: string;
  banReason: string;
  validityDate: string;
  action?: string;
};

const blacklistData: BlacklistEntry[] = [
  {
    fullName: "John Smith",
    idNumber: "19837492847",
    propertyId: "PR-00124",
    banReason: "Illegal construction",
    validityDate: "2025-12-31",
    action: "",
  },
  {
    fullName: "Emma Johnson",
    idNumber: "29485719374",
    propertyId: "PR-00987",
    banReason: "Unauthorized renovation",
    validityDate: "2025-11-30",
    action: "",
  },
  {
    fullName: "Michael Brown",
    idNumber: "10938475629",
    propertyId: "PR-00561",
    banReason: "False ownership claim",
    validityDate: "2026-01-15",
    action: "",
  },
  {
    fullName: "Olivia Davis",
    idNumber: "38294716203",
    propertyId: "PR-00345",
    banReason: "Unauthorized extension",
    validityDate: "2025-10-10",
    action: "",
  },
  {
    fullName: "William Taylor",
    idNumber: "19283746501",
    propertyId: "PR-00712",
    banReason: "Zoning violation",
    validityDate: "2025-09-01",
    action: "",
  },
  {
    fullName: "Sophia Moore",
    idNumber: "56782910438",
    propertyId: "PR-00231",
    banReason: "Unregistered modification",
    validityDate: "2026-02-20",
    action: "",
  },
  {
    fullName: "James Anderson",
    idNumber: "83726194850",
    propertyId: "PR-00645",
    banReason: "Invalid permit",
    validityDate: "2025-08-15",
    action: "",
  },
  {
    fullName: "Isabella Thomas",
    idNumber: "91827364501",
    propertyId: "PR-00874",
    banReason: "Common area abuse",
    validityDate: "2025-12-01",
    action: "",
  },
  {
    fullName: "Benjamin Jackson",
    idNumber: "10293847566",
    propertyId: "PR-00175",
    banReason: "False declaration",
    validityDate: "2026-03-05",
    action: "",
  },
];

function Blacklist() {
  const [search, setSearch] = useState<string>("");

  return (
    <Stack className="flex flex-col gap-[1rem]">
      <div className="px-[2rem] pt-[1rem] flex flex-col gap-[1rem]">
        <Title level={2}>Court Decision Blacklist</Title>
        <Search
          name="search"
          label="Search from Blacklist:"
          value={search}
          onChange={(value) => setSearch(value)}
        />
      </div>
      <Line />
      <div className="overflow-hidden">
        <Table columns={columns} minWidth="min-w-[90rem]">
          {blacklistData.map((entry, index) => (
            <Tr key={index}>
              <Td>
                <Text>{entry.fullName}</Text>
              </Td>
              <Td>
                <Text>{entry.idNumber}</Text>
              </Td>
              <Td>
                <Text>{entry.propertyId}</Text>
              </Td>
              <Td>
                <Text>{entry.banReason}</Text>
              </Td>
              <Td>
                <Text>{entry.validityDate}</Text>
              </Td>
              <Td>
                <div className="flex items-center gap-[4rem]">
                  <Icon type="regular" icon="pen" />
                  <Icon type="regular" icon="clock" />
                  <Icon type="regular" icon="eye" />
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </div>
    </Stack>
  );
}

export default Blacklist;
