import { SegmentedControl, SegmentedControlItem } from "@mantine/core";

type StyledTabsProps = {
  value: string;
  onChange: (value: string) => void;
  mt?: number;
  radius?: number;
  data: (string | SegmentedControlItem)[];
};

const StyledTabs = ({
  value,
  onChange,
  mt = 0,
  radius = 10,
  data,
}: StyledTabsProps) => {
  return (
    <SegmentedControl
      w={"100%"}
      mt={mt}
      className="styled-tab"
      radius={radius}
      transitionDuration={500}
      value={value}
      onChange={onChange}
      data={data}
    />
  );
};

export default StyledTabs;
