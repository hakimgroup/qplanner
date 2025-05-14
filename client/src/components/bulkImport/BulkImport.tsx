// src/components/BulkImport.tsx
import { useState } from "react";
import Papa from "papaparse";
import { Box, Button, FileButton, Group } from "@mantine/core";
import api from "@/api/express";
import { toast } from "sonner";

type Row = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	practiceName: string;
	practiceBuddyName: string;
	campaignName: string;
	startDate: string; // e.g. "2025-05-01"
	endDate: string; // e.g. "2025-05-31"
	additionalNotes: string;
};

export default function BulkImport() {
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);

	const handleUpload = () => {
		if (!file) return;
		Papa.parse<Row>(file, {
			header: true,
			skipEmptyLines: true,
			complete: async (results) => {
				setLoading(true);

				const rows = results.data;

				try {
					// send rows to the import endpoint
					const { data: report } = await api.post(
						"/import-campaigns",
						{ rows }
					);
					// update your state with the returned report
					setLoading(false);
					toast.success("Automation completed successfully!!", {
						position: "top-center",
					});
				} catch (error: any) {
					setLoading(false);
					console.error("Import failed:", error);
					// you can also set an error state here if you like
				}
			},
		});
	};

	return (
		<Group mt="md">
			<FileButton onChange={(f) => setFile(f || null)} accept=".csv">
				{(props) => (
					<Button size="xs" color="green.7" radius="xs" {...props}>
						Choose CSV (users + campaigns)
					</Button>
				)}
			</FileButton>

			<Button
				size="xs"
				radius="xs"
				onClick={handleUpload}
				disabled={!file}
				loading={loading}
			>
				Process signup & campaign data
			</Button>
		</Group>
	);
}
