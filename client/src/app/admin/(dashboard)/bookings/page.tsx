"use client";

import React, { useEffect, useState } from 'react'
import { Booking, BookingPagination, BookingStatus } from './type';
import api from '@/src/lib/axiosIntercepter';
import { DataTable } from '@/src/components/common/data-table';
import { getBookingColumns } from './column';
import { useLocaleStore } from '@/src/store/localeStore';

export default function BoookingPage() {
  const [data, setData] = useState()
  const { msgs } = useLocaleStore();
  console.log("msgsmsgs" , msgs)
  const fetchBookings = React.useCallback(async (
    pg: number,
    ps: number,
    status: BookingStatus | "",
  ) => {
    try {
      const params: Record<string, string | number> = { page: pg, pageSize: ps };
      if (status) params["status"] = status;
      const response = await api.get("/admin/bookings", { params }) as {
        data: { data: Booking[]; meta: BookingPagination };
      };
      console.log("response-->-->", response?.data)
      setData(response?.data)
    } catch (err) {
      const e = err as { message?: string };
    } finally {
    }
  }, []);


  useEffect(() => {
    fetchBookings(0, 10, "")
  }, [])

  const updateStatus = async (bookingId: string, status: Booking["status"]) => {
    try {
    const res =  await api.patch(`/admin/bookings/${bookingId}/status`, { status });
    if (res.success) {
    fetchBookings(0, 10, "")
    }

    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };


  const columns = React.useMemo(
    () => getBookingColumns({ onStatusChange: updateStatus, msgs }),
    [msgs, updateStatus]
  );

  return (
    <>
      {data && <DataTable
        columns={columns}
        data={data?.data}
      />}
    </>
  )
}


