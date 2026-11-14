"use client"

import * as React from "react"
import type { ControllerProps, FieldPath, FieldValues, UseFormProps, UseFormReturn } from "react-hook-form"
import { useForm, Controller } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ ...props }, ref) => {
    return <form ref={ref} {...props} />
  }
)
Form.displayName = "Form"

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue<FieldValues, FieldPath<FieldValues>>>(
  {} as FormFieldContextValue<FieldValues, FieldPath<FieldValues>>
)

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends ControllerProps<TFieldValues, TName> {}

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: FormFieldProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}
FormField.displayName = "FormField"

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  )
)
FormItem.displayName = "FormItem"

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, ...props }, ref) => (
    <Label
      ref={ref}
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    />
  )
)
FormLabel.displayName = "FormLabel"

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
)
FormControl.displayName = "FormControl"

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
FormDescription.displayName = "FormDescription"

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  )
)
FormMessage.displayName = "FormMessage"

export {
  type FormFieldContextValue,
  FormFieldContext,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}

export interface UseFormFieldReturn<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  id: string
  name: TName
  formItemId: string
  formDescriptionId: string
  formMessageId: string
  invalid: boolean
  isDirty: boolean
  isTouched: boolean
  error: TFieldValues[TName] | null
}

interface FormItemContextValue {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

export const useFormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
}: FormFieldProps<TFieldValues, TName>): UseFormFieldReturn<TFieldValues, TName> => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-description`,
    formMessageId: `${id}-form-message`,
    invalid: fieldState.invalid,
    isDirty: fieldState.isDirty,
    isTouched: fieldState.isTouched,
    error: fieldState.error as TFieldValues[TName] | null,
  }
}

interface FormProviderProps
  extends React.PropsWithoutRef<UseFormProps<FieldValues>>,
    React.RefAttributes<HTMLFormElement> {
  children: React.ReactNode
}

const FormProvider = React.forwardRef<HTMLFormElement, FormProviderProps>(
  ({ children, ...props }, ref) => {
    const [form] = React.useState(() => useForm(props))

    return (
      <FormProviderContext.Provider value={form}>
        <Form ref={ref}>{children}</Form>
      </FormProviderContext.Provider>
    )
  }
)
FormProvider.displayName = "FormProvider"

const FormProviderContext = React.createContext<
  UseFormReturn<FieldValues> | null
>(null)

export const useFormContext = () => {
  const context = React.useContext(FormProviderContext)
  if (!context) {
    throw new Error("useFormContext should be used within <FormProvider>")
  }
  return context
}

export { FormProvider, type FormProviderProps, type UseFormProps, type UseFormReturn, useForm, Controller }