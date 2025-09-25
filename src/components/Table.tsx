import React from "react";
import { Text } from "@/components";
import clsx from "clsx";

interface TableTypes {
  columns?: string[];
  minWidth: `min-w-[${string}]`;
  children: React.ReactNode;
}

function Table({ columns, minWidth, children }: TableTypes) {
  return (
    <table className={clsx("relative w-full", minWidth)}>
      {columns && (
        <thead>
          <Tr>
            {columns.map((column: string, index: number) => (
              <Th key={index}>{column}</Th>
            ))}
          </Tr>
        </thead>
      )}
      <tbody>{children}</tbody>
    </table>
  );
}

function Tr({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr className={clsx("group/tr", className)} onClick={onClick}>
      {children}
    </tr>
  );
}
React.memo(Tr);

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="group/th bg-white pt-[1rem] first:pl-[1rem] last:pr-[1rem]">
      <Text
        color="text-black"
        weight="font-bold"
        className="sticky top-[20rem] h-[4.275rem] bg-background px-[1.5rem] py-[1rem] text-left group-first/th:rounded-bl-[0.8rem] group-first/th:rounded-tl-[0.8rem] group-last/th:rounded-br-[0.8rem] group-last/th:rounded-tr-[0.8rem]"
      >
        {children}
      </Text>
    </th>
  );
}
React.memo(Th);

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={clsx(
        "border-b border-gray-light px-[1.5rem] py-[1rem] first:pl-[3rem] last:pr-[3rem] group-last/tr:border-b-0",
        className
      )}
    >
      {children}
    </td>
  );
}
React.memo(Td);

export default React.memo(Table);
export { Tr, Td };
