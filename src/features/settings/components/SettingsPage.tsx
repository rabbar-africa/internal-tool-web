import {
  Box,
  Button,
  Flex,
  Grid,
  Separator,
  Stack,
  Switch,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { UserDashboardContainer } from "@/components/hoc";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { toaster } from "@/components/ui";

const mockSave = () => {
  toaster.create({
    title: "Settings saved",
    type: "success",
    duration: 3000,
  });
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Box mb="4">
      <Text fontWeight="600" fontSize="15px" color="gray.500">
        {title}
      </Text>
      {subtitle && (
        <Text fontSize="12px" color="gray.300" mt="0.5">
          {subtitle}
        </Text>
      )}
    </Box>
  );
}

function CompanyProfileTab() {
  // const fakeRegister = (name: string) => ({
  //   name,
  //   onChange: () => {},
  //   onBlur: () => {},
  //   ref: () => {},
  // });

  return (
    <Stack gap="6" pt="4">
      <SectionTitle
        title="Company Information"
        subtitle="Basic details about your business"
      />
      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
        <CustomInput
          label="Company Name"
          // register={fakeRegister("companyName")}
          // defaultValue="Rabbar Africa"
        />
        <CustomInput
          label="Business Email"
          type="email"
          // register={fakeRegister("email")}
          // defaultValue="hello@rabbar.africa"
        />
        <CustomInput
          label="Phone Number"
          // register={fakeRegister("phone")}
          // defaultValue="+234 801 234 5678"
        />
        <CustomInput
          label="Website"
          // register={fakeRegister("website")}
          // defaultValue="https://rabbar.africa"
        />
        <Box gridColumn={{ sm: "1 / -1" }}>
          <CustomInput
            label="Address"
            // register={fakeRegister("address")}
            // defaultValue="12 Bode Thomas Street, Surulere, Lagos"
          />
        </Box>
        <CustomInput
          label="City"
          // register={fakeRegister("city")}
          // defaultValue="Lagos"
        />
        <CustomInput
          label="State"
          // register={fakeRegister("state")}
          // defaultValue="Lagos State"
        />
      </Grid>
      <Flex justify="flex-end">
        <Button onClick={mockSave}>Save Changes</Button>
      </Flex>
    </Stack>
  );
}

function TaxSettingsTab() {
  // const fakeRegister = (name: string) => ({
  //   name,
  //   onChange: () => {},
  //   onBlur: () => {},
  //   ref: () => {},
  // });

  const vatOptions = [
    { label: "0% (Exempt)", value: "0" },
    { label: "7.5% (Standard VAT)", value: "7.5" },
    { label: "5% (Reduced)", value: "5" },
  ];

  return (
    <Stack gap="6" pt="4">
      <SectionTitle
        title="Tax Configuration"
        subtitle="Configure VAT and withholding tax settings"
      />
      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
        <CustomInput
          label="Tax Identification Number (TIN)"
          // register={fakeRegister("tin")}
          // defaultValue="1234567-0001"
        />
        <CustomSelect
          label="Default VAT Rate"
          options={vatOptions}
          // value={{ label: "7.5% (Standard VAT)", value: "7.5" }}
          onChange={() => {}}
        />
        <CustomInput
          label="Withholding Tax Rate (%)"
          // type="number"
          // register={fakeRegister("wht")}
          // defaultValue="5"
        />
      </Grid>
      <Separator />
      <Stack gap="3">
        <Text fontWeight="600" fontSize="13px" color="gray.500">
          Tax Display on Invoices
        </Text>
        <Flex align="center" gap="3">
          <Switch.Root defaultChecked>
            <Switch.HiddenInput />
            <Switch.Control />
          </Switch.Root>
          <Text fontSize="13px" color="gray.500">
            Show VAT breakdown on invoices
          </Text>
        </Flex>
        <Flex align="center" gap="3">
          <Switch.Root defaultChecked>
            <Switch.HiddenInput />
            <Switch.Control />
          </Switch.Root>
          <Text fontSize="13px" color="gray.500">
            Include TIN on invoice header
          </Text>
        </Flex>
      </Stack>
      <Flex justify="flex-end">
        <Button onClick={mockSave}>Save Changes</Button>
      </Flex>
    </Stack>
  );
}

function InvoiceFormatTab() {
  // const fakeRegister = (name: string) => ({
  //   name,
  //   onChange: () => {},
  //   onBlur: () => {},
  //   ref: () => {},
  // });

  const prefixOptions = [
    { label: "INV", value: "INV" },
    { label: "RBR", value: "RBR" },
    { label: "RABBAR", value: "RABBAR" },
  ];
  const paddingOptions = [
    { label: "3 digits (001)", value: "3" },
    { label: "4 digits (0001)", value: "4" },
    { label: "5 digits (00001)", value: "5" },
  ];

  return (
    <Stack gap="6" pt="4">
      <SectionTitle
        title="Invoice Number Format"
        subtitle="Customize how invoice numbers are generated"
      />
      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }} gap="4">
        <CustomSelect
          label="Prefix"
          options={prefixOptions}
          // value={{ label: "INV", value: "INV" }}
          onChange={() => {}}
        />
        <CustomInput
          label="Year (auto)"
          // register={fakeRegister("year")}
          // defaultValue="2025"
        />
        <CustomSelect
          label="Sequence Padding"
          options={paddingOptions}
          // value={{ label: "3 digits (001)", value: "3" }}
          onChange={() => {}}
        />
      </Grid>
      <Box
        bg="gray.50"
        p="4"
        rounded="md"
        borderWidth="1px"
        borderColor="gray.100"
      >
        <Text fontSize="12px" color="gray.300" mb="1">
          Preview
        </Text>
        <Text fontWeight="600" color="gray.500" fontSize="18px">
          INV-2025-001
        </Text>
      </Box>
      <CustomInput
        label="Next Sequence Number"
        // type="number"
        // register={fakeRegister("nextSeq")}
        // defaultValue="8"
      />
      <Flex justify="flex-end">
        <Button onClick={mockSave}>Save Format</Button>
      </Flex>
    </Stack>
  );
}

function PaymentMethodsTab() {
  return (
    <Stack gap="6" pt="4">
      <SectionTitle
        title="Accepted Payment Methods"
        subtitle="Configure which payment methods appear on invoices"
      />
      <Stack gap="3">
        {[
          { label: "Cash", detail: "Physical cash payments", enabled: true },
          {
            label: "Bank Transfer",
            detail: "Direct bank-to-bank transfers",
            enabled: true,
          },
          {
            label: "POS / Card",
            detail: "Point-of-sale card payments",
            enabled: true,
          },
          { label: "Cheque", detail: "Cheque payments", enabled: false },
          {
            label: "Mobile Money",
            detail: "Mobile wallet payments",
            enabled: false,
          },
        ].map((method) => (
          <Flex
            key={method.label}
            align="center"
            justify="space-between"
            p="4"
            borderWidth="1px"
            borderColor="gray.75"
            rounded="md"
            bg="white"
          >
            <Box>
              <Text fontSize="14px" fontWeight="500" color="gray.500">
                {method.label}
              </Text>
              <Text fontSize="12px" color="gray.300">
                {method.detail}
              </Text>
            </Box>
            <Switch.Root defaultChecked={method.enabled}>
              <Switch.HiddenInput />
              <Switch.Control />
            </Switch.Root>
          </Flex>
        ))}
      </Stack>
      <Separator />
      <Box>
        <Text fontWeight="600" fontSize="13px" color="gray.500" mb="3">
          Bank Account Details
        </Text>
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
          <CustomInput
            label="Bank Name"
            // register={{ name: "bank", onChange: () => {}, onBlur: () => {}, ref: () => {} }}
            // defaultValue="First Bank of Nigeria"
          />
          <CustomInput
            label="Account Number"
            // register={{ name: "acctNum", onChange: () => {}, onBlur: () => {}, ref: () => {} }}
            // defaultValue="0123456789"
          />
          <CustomInput
            label="Account Name"
            // register={{ name: "acctName", onChange: () => {}, onBlur: () => {}, ref: () => {} }}
            // defaultValue="Rabbar Africa Ltd"
          />
          <CustomInput
            label="Sort Code"
            // register={{ name: "sortCode", onChange: () => {}, onBlur: () => {}, ref: () => {} }}
            // defaultValue="011"
          />
        </Grid>
      </Box>
      <Flex justify="flex-end">
        <Button onClick={mockSave}>Save Changes</Button>
      </Flex>
    </Stack>
  );
}

function ExpenseCategoriesTab() {
  const categories = [
    { name: "Parts & Materials", slug: "parts", color: "blue" },
    { name: "Labour", slug: "labour", color: "purple" },
    { name: "Overhead", slug: "overhead", color: "gray" },
    { name: "Utilities", slug: "utilities", color: "cyan" },
    { name: "Marketing", slug: "marketing", color: "pink" },
    { name: "Transport", slug: "transport", color: "orange" },
    { name: "Other", slug: "other", color: "gray" },
  ];

  return (
    <Stack gap="6" pt="4">
      <SectionTitle
        title="Expense Categories"
        subtitle="Manage the categories used for expense classification"
      />
      <Stack gap="2">
        {categories.map((cat) => (
          <Flex
            key={cat.slug}
            align="center"
            justify="space-between"
            p="3"
            borderWidth="1px"
            borderColor="gray.75"
            rounded="md"
            bg="white"
          >
            <Flex align="center" gap="3">
              <Box w="3" h="3" rounded="full" bg={`${cat.color}.400`} />
              <Text fontSize="14px" color="gray.500">
                {cat.name}
              </Text>
            </Flex>
            <Flex gap="2">
              <Button size="xs" variant="ghost" color="blue.500">
                Edit
              </Button>
              <Button size="xs" variant="ghost" color="red.400">
                Remove
              </Button>
            </Flex>
          </Flex>
        ))}
      </Stack>
      <Flex>
        <Button variant="outline" size="sm" onClick={mockSave}>
          + Add Category
        </Button>
      </Flex>
    </Stack>
  );
}

function RolesPermissionsTab() {
  const roles = [
    {
      name: "Administrator",
      description: "Full access to all modules and settings",
      users: 2,
      color: "red",
    },
    {
      name: "Manager",
      description:
        "Access to invoices, expenses, reports; cannot change settings",
      users: 3,
      color: "orange",
    },
    {
      name: "Accountant",
      description: "Access to invoices, payments, expenses; read-only reports",
      users: 2,
      color: "blue",
    },
    {
      name: "Viewer",
      description: "Read-only access across all modules",
      users: 1,
      color: "gray",
    },
  ];

  return (
    <Stack gap="6" pt="4">
      <SectionTitle
        title="Roles & Permissions"
        subtitle="Manage what each role can access and do"
      />
      <Stack gap="3">
        {roles.map((role) => (
          <Flex
            key={role.name}
            align="center"
            justify="space-between"
            p="4"
            borderWidth="1px"
            borderColor="gray.75"
            rounded="md"
            bg="white"
          >
            <Flex align="center" gap="3">
              <Box
                px="8px"
                py="3px"
                bg={`${role.color}.50`}
                rounded="md"
                minW="80px"
                textAlign="center"
              >
                <Text
                  fontSize="12px"
                  fontWeight="600"
                  color={`${role.color}.600`}
                >
                  {role.name}
                </Text>
              </Box>
              <Box>
                <Text fontSize="13px" color="gray.500">
                  {role.description}
                </Text>
                <Text fontSize="11px" color="gray.300">
                  {role.users} user{role.users !== 1 ? "s" : ""}
                </Text>
              </Box>
            </Flex>
            <Button size="xs" variant="outline" onClick={mockSave}>
              Edit
            </Button>
          </Flex>
        ))}
      </Stack>
      <Flex>
        <Button variant="outline" size="sm" onClick={mockSave}>
          + Create Role
        </Button>
      </Flex>
    </Stack>
  );
}

function CurrencyTab() {
  const currencyOptions = [
    { label: "Nigerian Naira (₦ NGN)", value: "NGN" },
    { label: "US Dollar ($ USD)", value: "USD" },
    { label: "British Pound (£ GBP)", value: "GBP" },
    { label: "Euro (€ EUR)", value: "EUR" },
  ];

  const formatOptions = [
    { label: "₦1,234,567.89", value: "comma" },
    { label: "₦1 234 567.89", value: "space" },
    { label: "₦1.234.567,89", value: "period" },
  ];

  return (
    <Stack gap="6" pt="4">
      <SectionTitle
        title="Currency Settings"
        subtitle="Configure the default currency for your business"
      />
      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
        <CustomSelect
          label="Default Currency"
          options={currencyOptions}
          // value={{ label: "Nigerian Naira (₦ NGN)", value: "NGN" }}
          onChange={() => {}}
        />
        <CustomSelect
          label="Number Format"
          options={formatOptions}
          // value={{ label: "₦1,234,567.89", value: "comma" }}
          onChange={() => {}}
        />
      </Grid>
      <Separator />
      <Stack gap="3">
        <Text fontWeight="600" fontSize="13px" color="gray.500">
          Multi-currency
        </Text>
        <Flex align="center" gap="3">
          <Switch.Root>
            <Switch.HiddenInput />
            <Switch.Control />
          </Switch.Root>
          <Text fontSize="13px" color="gray.500">
            Enable multi-currency invoicing
          </Text>
        </Flex>
      </Stack>
      <Flex justify="flex-end">
        <Button onClick={mockSave}>Save Changes</Button>
      </Flex>
    </Stack>
  );
}

// ─── Main SettingsPage ────────────────────────────────────────────────────────

export function SettingsPage() {
  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        <Box>
          <Text textStyle="h3-bold" color="gray.500">
            Settings
          </Text>
          <Text textStyle="small-regular" color="gray.300" mt="1">
            Configure your business preferences
          </Text>
        </Box>

        <Box
          bg="white"
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <Tabs.Root defaultValue="company">
            <Tabs.List px="4" pt="4" overflowX="auto" flexWrap="nowrap">
              <Tabs.Trigger value="company" whiteSpace="nowrap">
                Company Profile
              </Tabs.Trigger>
              <Tabs.Trigger value="tax" whiteSpace="nowrap">
                Tax Settings
              </Tabs.Trigger>
              <Tabs.Trigger value="invoice-format" whiteSpace="nowrap">
                Invoice Format
              </Tabs.Trigger>
              <Tabs.Trigger value="payment-methods" whiteSpace="nowrap">
                Payment Methods
              </Tabs.Trigger>
              <Tabs.Trigger value="expense-categories" whiteSpace="nowrap">
                Expense Categories
              </Tabs.Trigger>
              <Tabs.Trigger value="roles" whiteSpace="nowrap">
                Roles & Permissions
              </Tabs.Trigger>
              <Tabs.Trigger value="currency" whiteSpace="nowrap">
                Currency
              </Tabs.Trigger>
            </Tabs.List>

            <Box px="6" pb="6">
              <Tabs.Content value="company">
                <CompanyProfileTab />
              </Tabs.Content>
              <Tabs.Content value="tax">
                <TaxSettingsTab />
              </Tabs.Content>
              <Tabs.Content value="invoice-format">
                <InvoiceFormatTab />
              </Tabs.Content>
              <Tabs.Content value="payment-methods">
                <PaymentMethodsTab />
              </Tabs.Content>
              <Tabs.Content value="expense-categories">
                <ExpenseCategoriesTab />
              </Tabs.Content>
              <Tabs.Content value="roles">
                <RolesPermissionsTab />
              </Tabs.Content>
              <Tabs.Content value="currency">
                <CurrencyTab />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Box>
      </Stack>
    </UserDashboardContainer>
  );
}
