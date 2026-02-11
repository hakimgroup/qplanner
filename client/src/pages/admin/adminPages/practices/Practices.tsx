import { useState, useMemo } from "react";
import {
	Stack,
	Title,
	Text,
	Card,
	Grid,
	TextInput,
	Select,
	Button,
	Group,
	useMantineTheme,
} from "@mantine/core";
import { IconDownload, IconSearch } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase";
import { DatabaseTables } from "@/shared/shared.models";
import PracticesTable from "./PracticesTable";
import PracticesCsvUploader from "./PracticesCsvUploader";

const Practices = () => {
	const T = useMantineTheme().colors;

	const [query, setQuery] = useState("");
	const [debounced] = useDebouncedValue(query, 200);
	const [buddy, setBuddy] = useState("all");
	const [country, setCountry] = useState("all");

	const { data: practices = [], isLoading } = useQuery({
		queryKey: ["practices_admin"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from(DatabaseTables.Practices)
				.select("*")
				.order("name", { ascending: true });
			if (error) throw error;
			return data ?? [];
		},
	});

	const buddyOptions = useMemo(() => {
		const unique = [
			...new Set(
				practices
					.map((p: any) => p.buddy)
					.filter(Boolean)
			),
		].sort();
		return [
			{ label: "All Buddies", value: "all" },
			...unique.map((b: string) => ({ label: b, value: b })),
		];
	}, [practices]);

	const countryOptions = useMemo(() => {
		const unique = [
			...new Set(
				practices
					.map((p: any) => p.country)
					.filter(Boolean)
			),
		].sort();
		return [
			{ label: "All Countries", value: "all" },
			...unique.map((c: string) => ({ label: c, value: c })),
		];
	}, [practices]);

	const filteredPractices = useMemo(() => {
		let list = practices as any[];

		if (buddy !== "all") {
			list = list.filter((p) => p.buddy === buddy);
		}
		if (country !== "all") {
			list = list.filter((p) => p.country === country);
		}

		const q = (debounced || "").trim().toLowerCase();
		if (q) {
			list = list.filter((p) => {
				const hay = [
					p.name ?? "",
					p.address ?? "",
					p.post_code ?? "",
					p.email ?? "",
				]
					.join(" ")
					.toLowerCase();
				return hay.includes(q);
			});
		}

		return list;
	}, [practices, buddy, country, debounced]);

	const clearFilters = () => {
		setQuery("");
		setBuddy("all");
		setCountry("all");
	};

	const exportCsv = () => {
		const headers = [
			"name",
			"address",
			"post_code",
			"country",
			"phone",
			"email",
			"website",
			"buddy",
			"uberall_business_id",
		];
		const escape = (v: any) => {
			const s = (v ?? "").toString();
			return s.includes(",") || s.includes('"') || s.includes("\n")
				? `"${s.replace(/"/g, '""')}"`
				: s;
		};
		const csvRows = [
			headers.join(","),
			...filteredPractices.map((p: any) =>
				headers.map((h) => escape(p[h])).join(",")
			),
		];
		const blob = new Blob([csvRows.join("\n")], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "practices_export.csv";
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<Stack gap={25}>
			<Stack gap={0}>
				<Title order={1}>Practices</Title>
				<Text c="gray.6">
					Manage practice locations and details
				</Text>
			</Stack>

			{/* Filters */}
			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				shadow="xs"
			>
				<Stack gap={10}>
					<Group align="center" justify="space-between" mb="xs">
						<Title order={4}>Filters & Search</Title>
						<Button
							variant="subtle"
							size="xs"
							onClick={clearFilters}
						>
							Clear filters
						</Button>
					</Group>

					<Grid>
						<Grid.Col span={6}>
							<TextInput
								radius={10}
								size="sm"
								fz="sm"
								placeholder="Search by name, address, post code, or email..."
								leftSection={<IconSearch size={18} />}
								value={query}
								onChange={(e) =>
									setQuery(e.currentTarget.value)
								}
							/>
						</Grid.Col>
						<Grid.Col span={3}>
							<Select
								radius={10}
								size="sm"
								data={buddyOptions}
								searchable
								nothingFoundMessage="No buddies found"
								value={buddy}
								onChange={(v) => setBuddy(v ?? "all")}
								comboboxProps={{
									width: 250,
									position: "bottom-end",
								}}
							/>
						</Grid.Col>
						<Grid.Col span={3}>
							<Select
								radius={10}
								size="sm"
								data={countryOptions}
								searchable
								nothingFoundMessage="No countries found"
								value={country}
								onChange={(v) => setCountry(v ?? "all")}
								comboboxProps={{
									width: 200,
									position: "bottom-end",
								}}
							/>
						</Grid.Col>
					</Grid>
				</Stack>
			</Card>

			{/* Table */}
			<Card
				p={25}
				radius={10}
				style={{ border: `1px solid ${T.blue[0]}` }}
				shadow="xs"
			>
				<Stack gap={30}>
					<Group justify="space-between">
						<Title order={3}>
							Practices{" "}
							<Text span fz={"h3"} fw={700} c={"blue.3"}>
								({filteredPractices.length})
							</Text>
						</Title>
						<Group>
							<Button
								variant="light"
								color="teal"
								leftSection={<IconDownload size={14} />}
								onClick={exportCsv}
								disabled={filteredPractices.length === 0}
							>
								Export CSV
							</Button>
							<PracticesCsvUploader />
						</Group>
					</Group>
					<PracticesTable
						practices={filteredPractices}
						loading={isLoading}
					/>
				</Stack>
			</Card>
		</Stack>
	);
};

export default Practices;
