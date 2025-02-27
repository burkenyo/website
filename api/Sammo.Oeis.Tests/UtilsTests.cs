// Copyright © 2024 Samuel Justin Speth Gabay
// Licensed under the GNU Affero Public License, Version 3

using System.Runtime.InteropServices;

namespace Sammo.Oeis.Tests;

public static class UtilsTests
{
    [Fact]
    public static void StackStringBuilder_Exhausted_AppendEmptyOk()
    {
        StackStringBuilder builder = default;

        builder.Append(new String('\0', builder.RemainingCapacity));

        Assert.Equal(0, builder.RemainingCapacity);

        builder.Append("");
        builder.Append(null);
    }

    [Fact]
    public static void StackStringBuilder_Exhausted_AppendsThrow()
    {
        StackStringBuilder builder = default;

        builder.Append(new String('\0', builder.RemainingCapacity));

        // not using assert.throws because we have a ref struct
        // that cannot be captured in the lambda it requires

        try
        {
            Assert.Equal(0, builder.RemainingCapacity);
            builder.Append("foo");

            Assert.Fail("Exception not thrown as expected!");
        }
        catch (InvalidOperationException) { }

        try
        {
            Assert.Equal(0, builder.RemainingCapacity);
            builder.Append('p');

            Assert.Fail("Exception not thrown as expected!");
        }
        catch (InvalidOperationException) { }

        try
        {
            Assert.Equal(0, builder.RemainingCapacity);
            builder.Append(90);

            Assert.Fail("Exception not thrown as expected!");
        }
        catch (InvalidOperationException) { }
    }

    [Fact]
    public static void StackStringBuilder_Append_ValuesAppended()
    {
        StackStringBuilder builder = new();
        var remainingCapacity = builder.RemainingCapacity;

        Assert.True(remainingCapacity > 0);

        builder.Append(90);

        Assert.Equal(remainingCapacity -= "90".Length, builder.RemainingCapacity);

        builder.Append("foo");

        Assert.Equal(remainingCapacity -= "foo".Length, builder.RemainingCapacity);

        builder.Append('#');

        Assert.Equal(--remainingCapacity, builder.RemainingCapacity);

        var epoch = new DateTime(1970, 1, 1);
        builder.Append(epoch, "yyyy-MM-dd");

        Assert.Equal(remainingCapacity -= "1970-01-01".Length, builder.RemainingCapacity);

        Assert.Equal("90foo#1970-01-01", builder.ToString());
    }

    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    readonly struct CrunchyStruct
    {
        readonly int A;
        readonly bool B;
        readonly short C;
    }
}
