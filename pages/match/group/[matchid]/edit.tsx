import { useRouter } from "next/router";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { useQuery, useQueryClient } from "react-query";
import styled from "styled-components";
import tw from "twin.macro";
import { matchInfoType } from "../../../../types";
import { useAuth } from "../../../../utils/useAuth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const maps = [
  "Nuke",
  "Inferno",
  "Overpass",
  "Mirage",
  "Vertigo",
  "Ancient",
  "Dust2",
];

const MatchForm = styled.form`
  ${tw`grid grid-cols-8  gap-1 max-w-2xl`}
`;
const NumberInput = styled.input`
  ${tw`bg-gray-600 text-gray-900 w-14 text-center`}
  -webkit-appearance: none;
  -moz-appearance: textfield;
`;

const MapSelect = styled.select`
  ${tw`bg-gray-600 text-gray-900 p-1 col-span-2`}
`;

const TeamLabel = styled.label`
  ${tw`col-span-2 text-center`}
`;

const SaveButton = styled.input`
  ${tw`bg-green-400 text-xl text-gray-900 rounded-xl border px-4 py-2 cursor-pointer col-start-5 disabled:bg-gray-400 disabled:cursor-not-allowed`}
`;

const EndGameButton = styled.button`
  ${tw`bg-green-400 text-xl text-gray-900 rounded-xl border px-4 py-2 cursor-pointer col-start-7 col-end-9 disabled:bg-gray-400 disabled:cursor-not-allowed`}
`;

const DP = styled(DatePicker)`
  ${tw`bg-gray-600 text-gray-900`}
`;

const EditMatch = () => {
  const router = useRouter();
  const { matchid } = router.query;
  const { user } = useAuth();

  React.useEffect(() => {
    if (!user) {
      return;
    }
    if (!user.email) {
      router.replace("/");
    }
  }, [user]);
  const {
    data: matchData,
    isLoading: isMatchLoading,
    isError: isMatchError,
  } = useQuery<matchInfoType>(
    ["match", matchid],
    async ({ queryKey }) => {
      console.log(queryKey);

      const [_key, matchid] = queryKey;

      const f = await fetch(`/api/match/group/${matchid}`);
      if (!f.ok) {
        throw new Error("Network response was not ok");
      }
      return f.json();
    },
    {
      enabled: !!matchid,
    }
  );
  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (isMatchLoading || !matchData) {
    return <div>Loading...</div>;
  }

  const onSubmit = async (formData: any) => {
    console.log(formData);
    const data = {
      maps: [
        {
          team1Score: formData.map1team1Score,
          team2Score: formData.map1team2Score,
          map: formData.map1,
        },
        {
          team1Score: formData.map2team1Score,
          team2Score: formData.map2team2Score,
          map: formData.map2,
        },
        {
          team1Score: formData.map3team1Score,
          team2Score: formData.map3team2Score,
          map: formData.map3,
        },
      ],
      matchDate: (formData.dateInput as Date).valueOf(),
    };

    await fetch(`/api/match/group/${matchid}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data }),
    });
    toast.success("Game data has been saved");
  };

  const endGame = async () => {
    await fetch(`/api/match/group/${matchid}`, {
      method: "POST",
    });
    queryClient.invalidateQueries("match");

    toast.success("Game has ended");
  };

  return (
    <div>
      <Toaster />
      {matchData.team1.name} vs {matchData.team2.name}
      <MatchForm onSubmit={handleSubmit(onSubmit)}>
        {matchData?.maps.map((map, index) => {
          return (
            <React.Fragment key={index}>
              <TeamLabel>{matchData.team1.name} Score:</TeamLabel>
              <NumberInput
                defaultValue={map.team1Score}
                type="number"
                {...register(`map${index + 1}team1Score`, {
                  min: 0,
                  valueAsNumber: true,
                })}
              />
              <MapSelect
                defaultValue={map.map}
                {...register(`map${index + 1}`)}
              >
                <option value="">TBA</option>
                {maps.map((mapOption) => (
                  <option value={mapOption} key={mapOption}>
                    {mapOption}
                  </option>
                ))}
              </MapSelect>
              <TeamLabel>{matchData.team2.name} Score:</TeamLabel>
              <NumberInput
                defaultValue={map.team2Score}
                type="number"
                {...register(`map${index + 1}team2Score`, {
                  min: 0,
                  valueAsNumber: true,
                })}
              />
            </React.Fragment>
          );
        })}
        <Controller
          control={control}
          name="dateInput"
          defaultValue={matchData.date}
          render={({ field }) => (
            <DP
              placeholderText="Select date"
              onChange={(date) => field.onChange(date)}
              showTimeSelect
              selected={field.value}
              timeFormat="HH:mm"
              dateFormat="d/M HH:mm"
            />
          )}
        />
        <SaveButton type="submit" value="Save" disabled={matchData.matchDone} />
      </MatchForm>
      <EndGameButton disabled={matchData.matchDone} onClick={endGame}>
        End Game
      </EndGameButton>
    </div>
  );
};

export default EditMatch;
