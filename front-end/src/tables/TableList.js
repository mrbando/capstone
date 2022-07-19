import React from "react";
import TableCard from "./TableCard";

function TableList({ tables }) {
    let listTable = tables.map((table) => (
        <TableCard key={table.table_id} table={table} />
    ))
    return <div>{listTable}</div>
}
export default TableList;