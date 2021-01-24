import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import Item from './item';
import LoadingSpinner from '../loading-spinner';
import styles from './DeliveriesList.module.scss';
import { RegionSheetCodes } from '../../config/constants';

const Day = {
	Tuesday: 'Tuesday',
	Thursday: 'Thursday',
	Sunday: 'Sunday',
};

const getNextDay = () => {
	const today = dayjs().day();
	switch (today) {
		case 1:
			return { day: Day.Tuesday, date: dayjs().add(1, 'day') };
		case 2:
			return { day: Day.Tuesday, date: dayjs() };
		case 3:
			return { day: Day.Thursday, date: dayjs().add(1, 'day') };
		case 4:
			return { day: Day.Thursday, date: dayjs() };
		case 5:
			return { day: Day.Sunday, date: dayjs().add(2, 'day') };
		case 6:
			return { day: Day.Sunday, date: dayjs().add(1, 'day') };
		case 0:
			return { day: Day.Sunday, date: dayjs() };
	}
};

const getSheetData = async (sheetId) => {
	try {
		return await axios.get(`/api/getSheetData/${sheetId}`);
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error(e);
	}
};

const DeliveriesList = ({ region }) => {
	const [data, setData] = useState();
	const [isLoading, setIsLoading] = useState(true);
	const { day: nextDay, date } = getNextDay();

	useEffect(() => {
		setIsLoading(true);
		getSheetData(RegionSheetCodes[region]).then((sheetData) => {
			const cleanData = sheetData?.data?.rows.filter(
				(row) => row.deliveries[nextDay] > 0,
			);
			setData(cleanData);
			setIsLoading(false);
		});
	}, [nextDay, region]);

	if (!data || isLoading) return <LoadingSpinner />;

	return (
		<div className={styles.root}>
			<Box d="flex" ml={2} mr={2}>
				<Text>Deliveries for </Text>
				<Text fontWeight={700} ml={1}>
					{date.format('DD/MM/YYYY')}
				</Text>
				<Text>&nbsp;in </Text>
				<Text fontWeight={700} ml={1}>
					{region}
				</Text>
			</Box>
			<ul className={styles.list}>
				{data.map((item) => {
					const portions = item.deliveries[nextDay];
					return (
						<Item data={item} portions={portions} key={item.id} />
					);
				})}
			</ul>
		</div>
	);
};

DeliveriesList.propTypes = {
	region: PropTypes.string.isRequired,
};

export default DeliveriesList;
