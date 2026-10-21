"use client"

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

const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),

  category: z.enum(CATEGORIES, {
    message: "Please select a valid category",
  }),

  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description is too long"),

  price: z
    .number({ message: "Price must be a number" })
    .int("Price must be a whole number")
    .positive("Price must be greater than 0"),

  duration: z
    .number({ message: "Duration must be a number" })
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0"),

  isActive: z.boolean(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface CreateServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onCreated?: (service: Service) => void;
  onUpdated?: (service: Service) => void;
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
        {required && (
          <span className="ml-0.5 text-destructive">*</span>
        )}
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
  service = null,
  onCreated,
  onUpdated,
}: CreateServiceDialogProps) {
  const isEditMode = service !== null;
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  React.useEffect(() => {
    if (!open) return;

    if (service) {
      reset({
        name: service.name,
        category: service.category as (typeof CATEGORIES)[number],
        description: service.description,
        price: service.price,
        duration: service.duration,
        isActive: service.isActive,
      });
    } else {
      reset({
        name: "",
        category: undefined,
        description: "",
        price: undefined,
        duration: undefined,
        isActive: true,
      });
    }

    setApiError(null);
  }, [open, service, reset]);

  async function onSubmit(values: ServiceFormValues) {
    setApiError(null);

    try {
      const payload = {
        name: values.name.trim(),
        category: values.category,
        description: values.description.trim(),
        price: values.price,
        duration: values.duration,
        isActive: values.isActive,
      };

      if (isEditMode && service) {
        const response = (await api.put(
          `/admin/services/${service.id}`,
          payload,
        )) as { success: boolean; message: string; data: Service };

        onUpdated?.(response.data);
      } else {
        const response = (await api.post(
          "/admin/services",
          payload,
        )) as { success: boolean; message: string; data: Service };

        onCreated?.(response.data);
      }

      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : undefined;

      setApiError(
        message ??
          `Failed to ${isEditMode ? "update" : "create"} service. Please try again.`,
      );
    }
  }

  const selectedCategory = watch("category");
  const isActiveValue = watch("isActive");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="px-6 pb-4 pt-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {isEditMode ? "Edit Service" : "Create New Service"}
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground">
              {isEditMode
                ? "Update the details below and save your changes."
                : "Fill in the details below. All fields marked * are required."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          id="service-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="max-h-[60vh] space-y-4 overflow-y-auto px-6"
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
              {...register("name", {
                onChange: () => setApiError(null),
              })}
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
              onValueChange={(value) => {
                setValue(
                  "category",
                  value as (typeof CATEGORIES)[number],
                  { shouldValidate: true, shouldDirty: true },
                );
                setApiError(null);
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="svc-category"
                className="w-full"
                aria-invalid={!!errors.category}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>

              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
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
              {...register("description", {
                onChange: () => setApiError(null),
              })}
              className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm placeholder:text-muted-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 aria-[invalid=true]:border-destructive"
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

          {isEditMode && (
            <Field label="Status" htmlFor="svc-isActive">
              <div className="flex items-center gap-3 pt-0.5">
                <button
                  id="svc-isActive"
                  type="button"
                  role="switch"
                  aria-checked={isActiveValue}
                  disabled={isSubmitting}
                  onClick={() =>
                    setValue("isActive", !isActiveValue, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 ${
                    isActiveValue ? "bg-blue-600" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${
                      isActiveValue ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>

                <span className="text-sm text-muted-foreground">
                  {isActiveValue ? "Active" : "Inactive"}
                </span>
              </div>
            </Field>
          )}

          {apiError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {apiError}
            </div>
          )}
        </form>

        <div className="mt-4 flex flex-col-reverse gap-2 border-t bg-muted/50 px-6 py-4 sm:flex-row sm:justify-end">
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
            form="service-form"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting
              ? isEditMode
                ? "Saving…"
                : "Creating…"
              : isEditMode
                ? "Save Changes"
                : "Create Service"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}