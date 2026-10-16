"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import api from "@/src/lib/axiosIntercepter";
import type { Service } from "./type";

const CATEGORIES = [
  "Cleaning",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Gardening",
] as const;


const createServiceSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description is too long"),
  price: z
    .number("Price must be a number")
    .int("Price must be a whole number")
    .positive("Price must be greater than 0"),
  duration: z
    .number("Duration must be a number")
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0"),
});

type CreateServiceValues = z.infer<typeof createServiceSchema>;

interface CreateServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after the service is successfully created so the table can refresh */
  onCreated: (service: Service) => void;
}

function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CreateServiceDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateServiceDialogProps) {
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateServiceValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      category: undefined,
      description: "",
      price: undefined,
      duration: undefined,
    },
  });

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      reset();
      setApiError(null);
    }
  }, [open, reset]);

  async function onSubmit(values: CreateServiceValues) {
    setApiError(null);
    try {
      // POST /admin/services — axios interceptor unwraps response.data
      const response = (await api.post("/admin/services", {
        name:        values.name.trim(),
        category:    values.category,
        description: values.description.trim(),
        price:       values.price,
        duration:    values.duration,
      })) as { success: boolean; message: string; data: Service };

      onCreated(response.data);
      onOpenChange(false);
    } catch (err) {
      const e = err as { message?: string };
      setApiError(e?.message ?? "Failed to create service. Please try again.");
    }
  }

  const selectedCategory = watch("category");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
        <div className="px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Create New Service
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Fill in the details below. All fields marked{" "}
              <span className="text-destructive font-medium">*</span> are required.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          id="create-service-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="px-6 space-y-4 overflow-y-auto max-h-[60vh]"
        >
          <Field
            label="Service Name"
            htmlFor="svc-name"
            error={errors.name?.message}
            required
          >
            <Input
              id="svc-name"
              placeholder="e.g. Deep Home Cleaning"
              aria-invalid={!!errors.name}
              disabled={isSubmitting}
              {...register("name", { onChange: () => setApiError(null) })}
            />
          </Field>

          <Field
            label="Category"
            htmlFor="svc-category"
            error={errors.category?.message}
            required
          >
            <Select
              value={selectedCategory}
              onValueChange={(val) => {
                setValue("category", val as (typeof CATEGORIES)[number], {
                  shouldValidate: true,
                });
                setApiError(null);
              }}
            >
              <SelectTrigger
                id="svc-category"
                className="w-full"
                aria-invalid={!!errors.category}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Description"
            htmlFor="svc-description"
            error={errors.description?.message}
            required
          >
            <textarea
              id="svc-description"
              rows={3}
              placeholder="Briefly describe what this service includes…"
              disabled={isSubmitting}
              aria-invalid={!!errors.description}
              {...register("description", { onChange: () => setApiError(null) })}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2
                text-sm placeholder:text-muted-foreground resize-none
                focus-visible:outline-none focus-visible:border-ring
                focus-visible:ring-3 focus-visible:ring-ring/50
                disabled:opacity-50 aria-invalid:border-destructive
                transition-colors"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Price (₹)"
              htmlFor="svc-price"
              error={errors.price?.message}
              required
            >
              <Input
                id="svc-price"
                type="number"
                min={1}
                step={1}
                placeholder="e.g. 500"
                aria-invalid={!!errors.price}
                disabled={isSubmitting}
                {...register("price", {
                  valueAsNumber: true,
                  onChange: () => setApiError(null),
                })}
              />
            </Field>

            <Field
              label="Duration (min)"
              htmlFor="svc-duration"
              error={errors.duration?.message}
              required
            >
              <Input
                id="svc-duration"
                type="number"
                min={1}
                step={1}
                placeholder="e.g. 60"
                aria-invalid={!!errors.duration}
                disabled={isSubmitting}
                {...register("duration", {
                  valueAsNumber: true,
                  onChange: () => setApiError(null),
                })}
              />
            </Field>
          </div>

          {apiError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10
                px-4 py-3 text-sm text-destructive"
            >
              {apiError}
            </div>
          )}
        </form>

        <div
          className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2
            border-t bg-muted/50 px-6 py-4 mt-4"
        >
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-service-form"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Creating…" : "Create Service"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
