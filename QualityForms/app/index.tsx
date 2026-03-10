import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, EmployeeFormValues } from '@/schema/employeeSchema';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

export default function EmployeeForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    mode: "onTouched", // Validates when user blurs the field
  });

  const onSubmit = (data: EmployeeFormValues) => {
    console.log("Form Submitted Successfully:", data);
    alert("Employee Saved!");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Employee Information</Text>

      <FormField 
        label="Full Name" 
        name="fullName" 
        control={control} 
        error={errors.fullName?.message} 
        placeholder="John Doe"
      />

      <FormField 
        label="Email Address" 
        name="email" 
        control={control} 
        error={errors.email?.message} 
        placeholder="john@company.com"
        keyboardType="email-address"
      />

      <FormField 
        label="Phone Number" 
        name="phone" 
        control={control} 
        error={errors.phone?.message} 
        placeholder="1234567890"
        keyboardType="phone-pad"
      />

      <FormField 
        label="Employee ID" 
        name="employeeId" 
        control={control} 
        error={errors.employeeId?.message} 
        placeholder="EMP-123"
      />

      <FormField 
        label="Postal Code" 
        name="postalCode" 
        control={control} 
        error={errors.postalCode?.message} 
        placeholder="A1B 2C3"
      />

      <View style={styles.buttonContainer}>
        <Button title="Submit Information" onPress={handleSubmit(onSubmit)} color="#007AFF" />
      </View>
      <SignInForm/>
      <SignUpForm/>
    </ScrollView>
  );
}

const FormField = ({ label, name, control, error, ...rest }: any) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.label}>{label}</Text>
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          style={[styles.input, error && styles.inputError]}
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          {...rest}
        />
      )}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputWrapper: { marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  inputError: { borderColor: '#ff3b30' },
  errorText: { color: '#ff3b30', fontSize: 12, marginTop: 4 },
  buttonContainer: { marginTop: 10 }
});