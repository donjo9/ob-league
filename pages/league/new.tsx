import * as React from "react";
import styled from "styled-components";
import { useQuery, useMutation } from "react-query";
import tw from "twin.macro";
import { useForm } from "react-hook-form";

const Container = styled.div`
  ${tw`flex flex-row bg-gray-700 items-start`}
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const Columns = styled.div`
  ${tw`m-2 p-2 border-2 border-gray-800 rounded-md bg-gray-700 text-gray-50 items-start h-auto w-52`}
`;

const TeamsContainer = styled.div`
  ${tw`w-max items-start`}
  display:flex;
`;

const Teams = styled.div`
  ${tw`border-2 border-gray-900 m-2 p-2 rounded bg-gray-800 cursor-pointer`}
`;
type TeamType = {
  id: number | string;
  name: string;
};

const AddTeam = styled.input`
  ${tw`p-2 bg-gray-600 border-2 border-gray-800 rounded`}
`;
const AddTeamButton = styled.input`
  ${tw`rounded border-2 bg-green-600 text-white my-2 p-2 border-green-700`}
`;
const AddTeamForm = styled.form`
  ${tw`flex flex-col p-2`}
`;

const NewLeague = () => {
  const { register, handleSubmit, reset } = useForm();
  const [deSelectedTeams, setDeselectedTeams] = React.useState<TeamType[]>([]);
  const [selectedTeams, setSelectedTeams] = React.useState<TeamType[]>([]);
  const mutation = useMutation((newTeam: TeamType) =>
    fetch("/api/team/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(newTeam),
    })
  );
  const { isLoading, error, data } = useQuery("teamData", async () => {
    const r = await fetch("/api/team/");
    return r.json();
  });

  React.useEffect(() => {
    if (!data) {
      return;
    }
    const n = [...data];

    const o = [...selectedTeams, ...deSelectedTeams].reduce((map, item) => {
      return map.set(item.name.toLowerCase(), item);
    }, new Map());
    const t = n.filter((x) => !o.has(x.name.toLowerCase()));

    const a = [...deSelectedTeams, ...t];

    setDeselectedTeams(a);
  }, [data]);

  if (error) return "An error has occurred: " + (error as Error).message;

  const selectTeam = (t: TeamType, index: number) => {
    const deselectedTeams = [...deSelectedTeams];
    const _selectedTeams = [...selectedTeams];
    _selectedTeams.push(deselectedTeams[index]);
    deselectedTeams.splice(index, 1);
    setDeselectedTeams(deselectedTeams);
    setSelectedTeams(_selectedTeams);
  };

  const deselectTeam = (t: TeamType, index: number) => {
    const deselectedTeams = [...deSelectedTeams];
    const _selectedTeams = [...selectedTeams];
    deselectedTeams.push(_selectedTeams[index]);
    _selectedTeams.splice(index, 1);
    setDeselectedTeams(deselectedTeams);
    setSelectedTeams(_selectedTeams);
  };

  return (
    <Container>
      <TeamsContainer>
        <Columns>
          <h1>{isLoading ? "Loading..." : "Available Teams"}</h1>
          {deSelectedTeams.length > 0
            ? deSelectedTeams.map((t, index) => {
                return (
                  <Teams
                    key={t.id}
                    onClick={() => {
                      selectTeam(t, index);
                    }}
                  >
                    {t.name}
                  </Teams>
                );
              })
            : null}
        </Columns>
        <Columns>
          <h1>Selected Teams</h1>
          {selectedTeams.length > 0
            ? selectedTeams.map((t, index) => {
                return (
                  <Teams
                    key={t.id}
                    onClick={() => {
                      deselectTeam(t, index);
                    }}
                  >
                    {t.name}
                  </Teams>
                );
              })
            : null}
        </Columns>
      </TeamsContainer>
      <AddTeamForm
        onSubmit={handleSubmit((d) => {
          console.log(d);
          const { name } = d;
          if (name === "") {
            return;
          }
          const o = [...selectedTeams, ...deSelectedTeams].some(
            (x) => x.name.toLowerCase() == name.toLowerCase()
          );

          if (!o) {
            const n = { id: new Date().valueOf(), name };
            const a = [...selectedTeams, n];
            setSelectedTeams(a);
            mutation.mutate(n);
            reset();
          } else {
            alert(`${name} excists`);
          }
        })}
      >
        <AddTeam
          {...register("name", { required: true })}
          placeholder="New Team Name"
        />

        <AddTeamButton type="submit" value="Add team" />
      </AddTeamForm>
    </Container>
  );
};

export default NewLeague;
